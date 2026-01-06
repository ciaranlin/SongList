/// <reference types="vite/client" />

// SVG类型声明，确保SVG被作为组件导入
declare module '*.svg' {
  import React from 'react';
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
