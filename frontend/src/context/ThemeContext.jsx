// Copyright (c) 2026 MyCompany LLC
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('app_theme') || 'claro');

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'oscuro') {
      root.classList.add('dark');
      root.classList.remove('combinado');
    } else if (theme === 'combinado') {
      root.classList.remove('dark');
      root.classList.add('combinado');
    } else {
      root.classList.remove('dark');
      root.classList.remove('combinado');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
