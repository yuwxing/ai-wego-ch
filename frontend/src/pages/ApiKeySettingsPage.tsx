import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Eye, EyeOff, Check, AlertCircle, Search } from 'lucide-react';
import { getApiKey, setApiKey, getGoogleApiKey, setGoogleApiKey, getGoogleCx, setGoogleCx } from '../utils/deepseek';

const ApiKeySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [googleKey, setGoogleKey] = useState('');
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [cx, setCx] = useState('');
  const [googleSaved, setGoogleSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('deepseek_api_key');
    if (stored) setKey(stored);
    const gKey = localStorage.getItem('google_api_key');
    if (gKey) setGoogleKey(gKey);
    const gCx = localStorage.getItem('google_cx');
    if (gCx) setCx(gCx);
  }, []);

  const handleSave = () => {
    setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setKey('');
    localStorage.removeItem('deepseek_api_key');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveGoogle = () => {
    setGoogleApiKey(googleKey.trim());
    setGoogleCx(cx.trim());
    setGoogleSaved(true);
    setTimeout(() => setGoogleSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" /> 返回
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">DeepSeek API 密钥</h1>
              <p className="text-sm text-slate-500">配置你的 API 密钥以使用 AI 对话功能</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 pr-20 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              不填写则使用默认密钥（共享额度有限）
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {saved ? (
                <><Check className="w-5 h-5" /> 已保存</>
              ) : (
                <><Key className="w-5 h-5" /> 保存密钥</>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              恢复默认
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <p className="font-medium mb-1">如何获取 API Key？</p>
                <p>1. 访问 <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="underline">platform.deepseek.com</a> 注册账号</p>
                <p>2. 进入 API Keys 页面创建新密钥</p>
                <p>3. 复制并粘贴到上方输入框</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Google 搜索 API</h1>
              <p className="text-sm text-slate-500">用于求职招聘信息的自动搜索</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Google API Key</label>
            <div className="relative">
              <input
                type={showGoogleKey ? 'text' : 'password'}
                value={googleKey}
                onChange={e => setGoogleKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 pr-20 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={() => setShowGoogleKey(!showGoogleKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                {showGoogleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Engine ID (cx)</label>
            <input
              type="text"
              value={cx}
              onChange={e => setCx(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <button
            onClick={handleSaveGoogle}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {googleSaved ? (
              <><Check className="w-5 h-5" /> 已保存</>
            ) : (
              <><Search className="w-5 h-5" /> 保存 Google 搜索配置</>
            )}
          </button>

          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">如何获取？</p>
                <p>1. 访问 <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a> 创建 API Key</p>
                <p>2. 访问 <a href="https://programmablesearchengine.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Programmable Search</a> 创建搜索引擎，获取 cx</p>
                <p>3. 搜索时可配置为搜索全互联网</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettingsPage;