import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usageAPI } from '../utils/supabase';

interface User {
  id: number;
  username: string;
  email?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  loginAsGuest: () => void;
  logout: () => void;
  refreshUser: () => void;
  balance: number;
  updateBalance: (newBalance: number) => void;
  isGuest: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);

  // 初始化时从localStorage读取用户
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('解析用户信息失败', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 初始化余额 + 每日签到
  useEffect(() => {
    if (user?.id && user.id > 0) {
      fetchBalance(user.id);
      usageAPI.claimDailyBonus(user.id).then(r => {
        if (r.claimed) fetchBalance(user.id);
      });
    } else {
      setBalance(0);
    }
  }, [user]);

  const fetchBalance = async (userId: number) => {
    try {
      const response = await fetch(
        `https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/users?id=eq.${userId}&select=token_balance`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setBalance(data[0].token_balance || 0);
        }
      }
    } catch (err) {
      console.error('获取余额失败', err);
    }
  };

  // 更新余额方法
  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  // 登录：保存到localStorage并更新状态
  const login = (u: User) => {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('currentUserId', String(u.id));
    setUser(u);
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new Event('user-login'));
  };

  // 游客登录
  const loginAsGuest = () => {
    const guestUser = { id: -1, username: '游客', email: 'guest@aiwego' };
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('currentUserId', '-1');
    localStorage.setItem('isGuest', 'true');
    setUser(guestUser);
    window.dispatchEvent(new Event('user-login'));
  };

  const isGuest = !!user && user.id === -1;

  // 登出：清除localStorage并更新状态
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('isGuest');
    setUser(null);
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new Event('user-logout'));
  };

  // 刷新用户（从localStorage重新读取）
  const refreshUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('解析用户信息失败', e);
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, loginAsGuest, logout, refreshUser, balance, updateBalance, isGuest }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be inside UserProvider');
  }
  return ctx;
};
