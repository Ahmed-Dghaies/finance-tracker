import {
  mockExpenses,
  mockIncome,
  mockInvestments,
  mockPossessions,
  mockSettings,
  mockExchanges,
} from "./mock-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const SUPABASE_REST_PREFIX = `${SUPABASE_URL}/rest/v1/`;

const tableData: { [key: string]: any } = {
  expenses: mockExpenses,
  income: mockIncome,
  investments: mockInvestments,
  possessions: mockPossessions,
  settings: mockSettings,
  exchanges: mockExchanges,
};

const cloneRows = (rows: any[]) => JSON.parse(JSON.stringify(rows));

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

const applyFilters = (rows: any[], url: string) => {
  const searchParams = new URL(url).searchParams;
  let filtered = rows;

  // Basic eq. filtering (e.g., month=eq.2024-12)
  searchParams.forEach((value, key) => {
    if (key === "order" || key === "select") return;
    if (value.startsWith("eq.")) {
      const target = value.slice(3);
      filtered = filtered.filter((row) => String(row[key]) === target);
    }
  });

  // Basic ordering support (e.g., order=date.desc)
  const orderParam = searchParams.get("order");
  if (orderParam) {
    const [field, dirRaw] = orderParam.split(".");
    const desc = dirRaw?.startsWith("desc");
    filtered = [...filtered].sort((a, b) => {
      if (a?.[field] === b?.[field]) return 0;
      const result = a?.[field] > b?.[field] ? 1 : -1;
      return desc ? -result : result;
    });
  }

  return filtered;
};

export const setSupabaseTable = (table: string, rows: any[]) => {
  tableData[table] = cloneRows(rows);
};

export const resetSupabaseTables = () => {
  // Reset to the original mock data instead of empty arrays
  tableData.expenses = cloneRows(mockExpenses);
  tableData.income = cloneRows(mockIncome);
  tableData.investments = cloneRows(mockInvestments);
  tableData.possessions = cloneRows(mockPossessions);
  tableData.settings = cloneRows(mockSettings);
  tableData.exchanges = cloneRows(mockExchanges);
};

const createUnhandledRequestError = (method: string, url: string) =>
  new Error(`Unhandled request: ${method} ${url}`);

const handleSupabaseRequest = async (request: Request) => {
  const table = request.url.slice(SUPABASE_REST_PREFIX.length).split("?")[0];
  const rows = tableData[table as string] || [];

  switch (request.method) {
    case "GET": {
      const filtered = applyFilters(rows, request.url);
      return jsonResponse(filtered, {
        status: 200,
        headers: {
          "Content-Range": `0-${filtered.length - 1}/${filtered.length}`,
        },
      });
    }
    case "POST": {
      const body = await request.json();
      tableData[table as string] = [...rows, body];
      return jsonResponse(body, { status: 201 });
    }
    default:
      return jsonResponse({ message: "Unhandled method" }, { status: 200 });
  }
};

let originalFetch: typeof globalThis.fetch | undefined;
let failOnUnhandledRequests = false;

export const server = {
  listen(options?: { onUnhandledRequest?: "error" | "bypass" }) {
    if (!globalThis.fetch) {
      throw new Error("global fetch is not available in the test environment");
    }

    failOnUnhandledRequests = options?.onUnhandledRequest === "error";

    if (!originalFetch) {
      originalFetch = globalThis.fetch.bind(globalThis);
    }

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init);

      if (request.url.startsWith(SUPABASE_REST_PREFIX)) {
        return handleSupabaseRequest(request);
      }

      if (failOnUnhandledRequests) {
        throw createUnhandledRequestError(request.method, request.url);
      }

      if (!originalFetch) {
        throw new Error("original fetch is not available");
      }

      return originalFetch(input, init);
    };
  },
  resetHandlers() {},
  close() {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }
  },
};
