import React from "react";

interface DashboardContextProps {
  context: any;
}

export default function DashboardContext({ context }: DashboardContextProps) {
  if (!context) {
    return (
      <div className="text-sm text-gray-500 italic">
        No dashboard context available
      </div>
    );
  }

  return (
    <div className="text-sm">
      <h3 className="font-medium mb-2">Dashboard Context</h3>
      
      {context.title && (
        <div className="mb-1">
          <span className="font-medium">Title:</span> {context.title}
        </div>
      )}
      
      {context.url && (
        <div className="mb-1 truncate">
          <span className="font-medium">URL:</span>{" "}
          <span className="text-gray-600 dark:text-gray-400">{context.url}</span>
        </div>
      )}
      
      {context.elements && context.elements.length > 0 && (
        <div>
          <span className="font-medium">Elements:</span>
          <ul className="list-disc list-inside pl-2">
            {context.elements.map((element: any, index: number) => (
              <li key={index} className="text-gray-600 dark:text-gray-400">
                {element.title || `Element ${index + 1}`} 
                {element.type && <span className="text-xs ml-1">({element.type})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
