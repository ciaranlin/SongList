import React from 'react';

// 错误示例：图标映射表中包含数据URL
const errorIconsMap = {
  github: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(0,0,0,1)'%3e%3cpath d='M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z'%3e%3c/path%3e%3c/svg%3e",
  youtube: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(0,0,0,1)'%3e%3cpath d='M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z'%3e%3c/path%3e%3c/svg%3e"
};

// 正确示例：图标映射表中包含React组件（通过SVGR导入）
import { Github, Youtube } from 'lucide-react';

const correctIconsMap = {
  github: Github,
  youtube: Youtube
};

// 混合示例：图标映射表中同时包含React组件和数据URL
const mixedIconsMap = {
  github: Github, // React组件
  youtube: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(0,0,0,1)'%3e%3cpath d='M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z'%3e%3c/path%3e%3c/svg%3e" // 数据URL
};

// 安全的Icon组件：能够同时处理React组件和数据URL
interface SafeIconProps {
  name: string;
  className?: string;
}

function SafeIcon({ name, className }: SafeIconProps) {
  const iconValue = mixedIconsMap[name];
  
  if (!iconValue) {
    return null;
  }
  
  // 检查图标值类型
  if (typeof iconValue === 'string') {
    // 正确模式：数据URL使用<img>标签渲染
    return <img src={iconValue} alt={name} className={className} />;
  } else {
    // 正确模式：React组件直接渲染
    const IconComponent = iconValue;
    return <IconComponent className={className} />;
  }
}

// 错误模式组件：尝试将数据URL作为组件渲染
function ErrorIcon({ name, className }: SafeIconProps) {
  const Icon = errorIconsMap[name];
  
  if (!Icon) {
    return null;
  }
  
  // 错误模式：直接将数据URL作为组件渲染
  // 这会导致React.createElement失败，因为Icon是字符串而非函数/组件
  return <Icon className={className} />;
}

// 示例展示组件
export function IconExample() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">图标渲染模式示例</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-red-600">❌ 错误模式</h3>
        <p className="mb-2">直接将数据URL作为组件渲染：</p>
        <code className="block bg-gray-100 p-2 rounded mb-2">
          const Icon = icons[name]; // Icon是字符串数据URL
          return &lt;Icon /&gt;;
        </code>
        <p className="text-sm text-gray-600 mb-2">结果：React.createElement失败，因为数据URL不是有效的组件名称</p>
        <div className="flex gap-4 mt-2">
          {/* 这个会抛出错误 */}
          {/* <ErrorIcon name="github" className="w-6 h-6" /> */}
          <span className="text-red-500">[预期错误：Failed to execute 'createElement'...]</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-green-600">✅ 正确模式1：数据URL使用&lt;img&gt;</h3>
        <p className="mb-2">将数据URL作为src属性传递给img标签：</p>
        <code className="block bg-gray-100 p-2 rounded mb-2">
          const iconUrl = icons[name]; // iconUrl是字符串数据URL
          return &lt;img src={iconUrl} alt={name} /&gt;;
        </code>
        <p className="text-sm text-gray-600 mb-2">结果：成功渲染SVG图片</p>
        <div className="flex gap-4 mt-2">
          <img 
            src={errorIconsMap.github} 
            alt="github" 
            className="w-6 h-6" 
          />
          <img 
            src={errorIconsMap.youtube} 
            alt="youtube" 
            className="w-6 h-6" 
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-green-600">✅ 正确模式2：通过SVGR导入React组件</h3>
        <p className="mb-2">使用@svgr/rollup插件将SVG导入为React组件：</p>
        <code className="block bg-gray-100 p-2 rounded mb-2">
          // vite.config.ts配置SVGR插件<br/>
          import svgr from '@svgr/rollup';<br/>
          plugins: [svgr()]<br/><br/>
          // 组件中导入使用<br/>
          import Github from './github.svg';
          return &lt;Github /&gt;;
        </code>
        <p className="text-sm text-gray-600 mb-2">结果：成功渲染SVG组件</p>
        <div className="flex gap-4 mt-2">
          <Github className="w-6 h-6" />
          <Youtube className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-600">🔧 安全的Icon组件解决方案</h3>
        <p className="mb-2">能够同时处理React组件和数据URL的安全组件：</p>
        <code className="block bg-gray-100 p-2 rounded mb-2">
          function SafeIcon({ name }) {
            const iconValue = icons[name];
            <br/>
            if (typeof iconValue === 'string') {
            <br/>
              return &lt;img src={iconValue} alt={name} /&gt;;
            <br/>
            } else {
            <br/>
              const IconComponent = iconValue;
            <br/>
              return &lt;IconComponent /&gt;;
            <br/>
            }
          }
        </code>
        <p className="text-sm text-gray-600 mb-2">结果：根据图标类型自动选择正确的渲染方式</p>
        <div className="flex gap-4 mt-2">
          <SafeIcon name="github" className="w-6 h-6" />
          <SafeIcon name="youtube" className="w-6 h-6" />
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">📋 核心原因</h3>
        <ul className="list-disc list-inside text-sm">
          <li>React组件名称必须是有效的标识符（函数、类、React组件）</li>
          <li>数据URL是字符串，不是有效的组件构造函数</li>
          <li>React.createElement("data:image/svg+xml,...") 会失败，因为它期望一个有效的标签名或组件</li>
          <li>解决方案：使用&lt;img src="数据URL" /&gt; 或通过SVGR将SVG导入为React组件</li>
        </ul>
      </div>
    </div>
  );
}
