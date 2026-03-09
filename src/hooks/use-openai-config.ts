'use client';

import { useState, useEffect } from 'react';

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

const DEFAULT_CONFIG: OpenAIConfig = {
  apiKey: '',
  model: 'gpt-4o',
  temperature: 0.7,
};

export function useOpenAIConfig() {
  const [config, setConfig] = useState<OpenAIConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('openai_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse config', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = (newConfig: OpenAIConfig) => {
    setConfig(newConfig);
    localStorage.setItem('openai_config', JSON.stringify(newConfig));
  };

  return { config, updateConfig, isLoaded };
}
