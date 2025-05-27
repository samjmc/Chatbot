import ChatWidget from "@/components/ChatWidget";

export default function WidgetTest() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
          <h1 className="text-3xl font-bold mb-4">Sales Performance Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Mock dashboard elements */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64 flex flex-col">
              <h3 className="font-medium mb-2">Monthly Sales Trend</h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-32 flex items-end justify-around px-4 space-x-2">
                  <div className="bg-blue-500 w-4 rounded-t" style={{ height: '40%' }}></div>
                  <div className="bg-blue-500 w-4 rounded-t" style={{ height: '60%' }}></div>
                  <div className="bg-blue-500 w-4 rounded-t" style={{ height: '30%' }}></div>
                  <div className="bg-blue-500 w-4 rounded-t" style={{ height: '80%' }}></div>
                  <div className="bg-blue-500 w-4 rounded-t" style={{ height: '50%' }}></div>
                  <div className="bg-blue-500 w-4 rounded-t" style={{ height: '70%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64 flex flex-col">
              <h3 className="font-medium mb-2">Regional Performance</h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-32 h-32 rounded-full border-8 border-blue-500 overflow-hidden">
                  <div className="absolute bg-green-500 w-full h-full left-0 top-0" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)' }}></div>
                  <div className="absolute bg-red-500 w-full h-full left-0 top-0" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 50%, 50% 50%)' }}></div>
                  <div className="absolute bg-yellow-500 w-full h-full left-0 top-0" style={{ clipPath: 'polygon(0 50%, 50% 50%, 50% 100%, 0 100%)' }}></div>
                  <div className="absolute bg-purple-500 w-full h-full left-0 top-0" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64 flex flex-col">
              <h3 className="font-medium mb-2">Top Products by Revenue</h3>
              <div className="flex-1 flex items-center">
                <div className="w-full space-y-3">
                  <div className="flex items-center">
                    <div className="w-24 truncate text-sm">Product A</div>
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="w-10 text-right text-sm">85%</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 truncate text-sm">Product B</div>
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <div className="w-10 text-right text-sm">72%</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 truncate text-sm">Product C</div>
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '61%' }}></div>
                    </div>
                    <div className="w-10 text-right text-sm">61%</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 truncate text-sm">Product D</div>
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '53%' }}></div>
                    </div>
                    <div className="w-10 text-right text-sm">53%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium mb-4">Dashboard Summary</h3>
            <div className="space-y-2">
              <p>This dashboard shows the sales performance across different regions and products.</p>
              <p>Key metrics:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Total Sales: $1,245,368</li>
                <li>YoY Growth: +12.3%</li>
                <li>Top Region: North America (42%)</li>
                <li>Best Performing Product: Product A</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* The ChatWidget component will be positioned at the bottom right */}
      <ChatWidget />
    </div>
  );
}