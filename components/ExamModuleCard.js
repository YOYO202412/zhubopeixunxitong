// components/ExamModuleCard.js
import { useRouter } from 'next/router';

export default function ExamModuleCard({ module, index }) {
  const router = useRouter();

  const startExam = (moduleId) => {
    console.log('开始考试，模块ID:', moduleId); // 添加调试日志
    console.log('当前路由:', router); // 查看路由状态
    
    // 确保模块ID是有效的数字
    if (!moduleId || isNaN(moduleId)) {
      console.error('无效的模块ID:', moduleId);
      alert('无效的考试模块');
      return;
    }
    
    // 使用 window.location 作为备用方案
    try {
      router.push(`/exam/${moduleId}`);
    } catch (error) {
      console.error('路由跳转失败:', error);
      // 备用方案：直接修改URL
      window.location.href = `/exam/${moduleId}`;
    }
  };

  return (
    <div className={`bento-card glass-morphism rounded-2xl p-4 md:p-6 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl md:text-2xl font-bold gradient-text">{module.name}</h3>
        <i className={`${module.icon} text-xl md:text-2xl text-[#FF3CAC]`}></i>
      </div>
      
      <div className="space-y-1 md:space-y-2 mb-3">
        {module.items.map((item, i) => (
          <div key={i} className="flex items-center space-x-2">
            <i className="fa-solid fa-check text-green-500 text-sm md:text-base"></i>
            <span className="text-gray-700 text-sm md:text-base">{item}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="relative w-12 h-12 md:w-16 md:h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              stroke="#e6e6e6"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              stroke={`url(#gradient-${index})`}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - module.progress / 100)}
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm font-bold">
            {module.progress}%
          </div>
        </div>
        
        <button 
          onClick={() => startExam(module.id)}
          className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:opacity-90 transition-opacity active:scale-95"
        >
          开始考试
        </button>
      </div>
    </div>
  );
}