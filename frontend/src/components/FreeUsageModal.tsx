import { X, Key, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  remaining: number;
  balance?: number;
  onPurchase?: () => void;
  onClose: () => void;
}

export default function FreeUsageModal({ remaining, balance = 0, onPurchase, onClose }: Props) {
  const navigate = useNavigate();
  const TOKEN_COST = 10;
  const canBuy = balance >= TOKEN_COST;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {remaining > 0 ? `还剩 ${remaining} 次免费体验` : '免费次数已用完'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          {remaining > 0
            ? '智能体聊天、群聊等功能需要消耗免费体验次数。'
            : canBuy
            ? '你还有积分，可以用积分继续使用。'
            : '免费体验次数已用完。你可以配置自己的 DeepSeek API Key 无限使用，或通过完成任务获取积分。'}
        </p>
        <div className="space-y-3">
          {remaining > 0 && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-400 hover:to-pink-400 transition-all"
            >
              继续使用（剩余 {remaining} 次）
            </button>
          )}
          {remaining <= 0 && canBuy && (
            <button
              onClick={() => { onPurchase?.(); onClose(); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" /> 消耗 {TOKEN_COST} 积分继续使用
            </button>
          )}
          <button
            onClick={() => { navigate('/settings/api-key'); onClose(); }}
            className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-600 font-medium hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" /> 去系统中心配置 API Key
          </button>
          {remaining <= 0 && !canBuy && (
            <p className="text-xs text-slate-400 text-center">
              配置你自己的 DeepSeek Key 后即可无限使用所有功能<br />
              当前积分：{balance}（需要至少 {TOKEN_COST} 积分）
            </p>
          )}
          {remaining <= 0 && canBuy && (
            <p className="text-xs text-slate-400 text-center">
              当前积分：{balance}，每次消耗 {TOKEN_COST} 积分
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
