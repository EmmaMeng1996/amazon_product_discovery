import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Upload, Settings, Eye } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-4xl font-bold text-white">Amazon 精品选品系统</h1>
          <p className="text-gray-400 mt-2">从大量产品中自动筛选出最值得研究的机会</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white">智能评分</h3>
                <p className="text-gray-400 text-sm mt-2">四维评分体系，自动筛选优质产品</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-white">批量导入</h3>
                <p className="text-gray-400 text-sm mt-2">支持 CSV 格式，快速导入产品数据</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white">可视化分析</h3>
                <p className="text-gray-400 text-sm mt-2">看板展示，多维度筛选和排序</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">核心功能</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>✓ 两层筛选引擎（硬过滤 + 智能评分）</p>
              <p>✓ 四维评分系统（竞争度、利润、差异化、开发难度）</p>
              <p>✓ 自动等级分类（A/B/C/D）</p>
              <p>✓ Dashboard 看板和统计分析</p>
              <p>✓ 多维度产品筛选和排序</p>
              <p>✓ 评分规则动态配置</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">快速开始</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">1. 导入产品数据</p>
                <Link href="/import">
                  <a>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Upload className="w-4 h-4 mr-2" />
                      上传 CSV 文件
                    </Button>
                  </a>
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">2. 查看分析看板</p>
                <Link href="/dashboard">
                  <a>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      进入看板
                    </Button>
                  </a>
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">3. 浏览产品列表</p>
                <Link href="/products">
                  <a>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Eye className="w-4 h-4 mr-2" />
                      产品列表
                    </Button>
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">系统导航</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard">
              <a>
                <Button variant="outline" className="w-full text-gray-300 border-gray-600 hover:bg-gray-700">
                  Dashboard
                </Button>
              </a>
            </Link>
            <Link href="/products">
              <a>
                <Button variant="outline" className="w-full text-gray-300 border-gray-600 hover:bg-gray-700">
                  产品列表
                </Button>
              </a>
            </Link>
            <Link href="/import">
              <a>
                <Button variant="outline" className="w-full text-gray-300 border-gray-600 hover:bg-gray-700">
                  导入数据
                </Button>
              </a>
            </Link>
            <Link href="/settings">
              <a>
                <Button variant="outline" className="w-full text-gray-300 border-gray-600 hover:bg-gray-700">
                  规则配置
                </Button>
              </a>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Amazon Product Discovery System v1.0</p>
          <p className="text-sm mt-2">极简数据风格 | 高效选品工具</p>
        </div>
      </div>
    </div>
  );
}
