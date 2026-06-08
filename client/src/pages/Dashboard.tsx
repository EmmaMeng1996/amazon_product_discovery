import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.product.getDashboardStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8">No data available</div>;
  }

  // Prepare chart data
  const gradeData = [
    { name: "A级", value: stats.gradeStats.A, fill: "#10b981" },
    { name: "B级", value: stats.gradeStats.B, fill: "#3b82f6" },
    { name: "C级", value: stats.gradeStats.C, fill: "#f59e0b" },
    { name: "D级", value: stats.gradeStats.D, fill: "#ef4444" },
  ];

  const scoreDistData = [
    { range: "85-100", count: stats.scoreDistribution["85-100"] },
    { range: "70-84", count: stats.scoreDistribution["70-84"] },
    { range: "60-69", count: stats.scoreDistribution["60-69"] },
    { range: "0-59", count: stats.scoreDistribution["0-59"] },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">选品分析看板</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">产品总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">已导入产品</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">A级产品</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.gradeStats.A}</div>
            <p className="text-xs text-gray-500 mt-1">强烈推荐</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">B级产品</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.gradeStats.B}</div>
            <p className="text-xs text-gray-500 mt-1">值得关注</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">通过硬过滤</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.passedHardFilter}</div>
            <p className="text-xs text-gray-500 mt-1">符合基本条件</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>推荐等级分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>评分分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Latest Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>最新推荐产品</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">ASIN</th>
                  <th className="text-left py-2 px-4">产品标题</th>
                  <th className="text-left py-2 px-4">类目</th>
                  <th className="text-right py-2 px-4">总分</th>
                  <th className="text-center py-2 px-4">等级</th>
                  <th className="text-left py-2 px-4">推荐原因</th>
                </tr>
              </thead>
              <tbody>
                {stats.latestRecommended.map((item) => (
                  <tr key={item.product.asin} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-mono text-xs">{item.product.asin}</td>
                    <td className="py-2 px-4 max-w-xs truncate">{item.product.title}</td>
                    <td className="py-2 px-4 text-xs">{item.product.category}</td>
                    <td className="py-2 px-4 text-right font-bold">{item.score.totalScore}</td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-white text-xs font-bold ${
                          item.score.grade === "A"
                            ? "bg-green-600"
                            : item.score.grade === "B"
                            ? "bg-blue-600"
                            : item.score.grade === "C"
                            ? "bg-amber-600"
                            : "bg-red-600"
                        }`}
                      >
                        {item.score.grade}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-600">{item.score.recommendReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
