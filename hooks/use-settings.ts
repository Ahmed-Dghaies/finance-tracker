import { useEffect, useState } from "react";

import { getAllSettigs, setSetting } from "@/lib/db/settings";

import type { ProjectSettings } from "@/lib/types";

const useSettings = () => {
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await getAllSettigs();
      setSettings(data);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const updateSettingsKey = async (key: string, value: any) => {
    await setSetting(key, value);
    refetch();
  };

  const refetch = async () => {
    const data = await getAllSettigs();
    setSettings(data);
  };

  return {
    state: { isLoading, settings },
    handlers: { refetch, updateSettingsKey },
  };
};

export default useSettings;
