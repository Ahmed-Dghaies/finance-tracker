import { useEffect, useState } from "react";

import { getAllPossessions } from "@/lib/db/possessions";

import type { Possession } from "@/lib/types";

const usePossessions = () => {
  const [possessions, setPossessions] = useState<Possession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await getAllPossessions();
      setPossessions(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return { state: { possessions, isLoading }, handdlers: {} };
};

export default usePossessions;
