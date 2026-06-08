import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import Papa from "papaparse";

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const importMutation = trpc.product.importCsv.useMutation();

  const handleDownloadTemplate = () => {
    const template = [
      [
        "asin",
        "title",
        "category",
        "price",
        "rating",
        "review_count",
        "seller_count",
        "weight",
        "dimensions",
        "product_url",
        "keyword",
      ],
      [
        "B0EXAMPLE1",
        "Sample Product Title",
        "Home & Kitchen",
        "29.99",
        "4.5",
        "1234",
        "3",
        "0.8",
        "10 x 20 x 30 cm",
        "https://www.amazon.com/dp/B0EXAMPLE1",
        "storage organizer",
      ],
    ];
    const csv = Papa.unparse(template);
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "amazon-product-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    // Parse CSV preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        setPreview(results.data.slice(0, 5));
      },
      error: (error: any) => {
        alert(`CSV 解析错误: ${error.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: any) => {
          try {
            const response = await importMutation.mutateAsync({
              data: results.data,
            });
            setResult(response);
          } catch (error) {
            alert(
              `导入失败: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          } finally {
            setImporting(false);
          }
        },
        error: (error: any) => {
          alert(`CSV 解析错误: ${error.message}`);
          setImporting(false);
        },
      });
    } catch (error) {
      alert(
        `导入失败: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setImporting(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">导入产品数据</h1>

      {/* Instructions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>导入说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-gray-700 mb-4">
                请准备包含以下字段的 CSV 文件：
              </p>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                <p>
                  asin, title, category, price, rating, review_count,
                  seller_count, weight, dimensions, product_url, keyword
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              下载 CSV 模板
            </Button>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            也支持卖家精灵字段：ASIN、商品标题、大类目、价格($)、评分、评分数、卖家数、商品重量、商品尺寸、商品详情页链接。
          </p>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>选择文件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input" className="cursor-pointer">
              <span className="text-blue-600 hover:underline">
                点击选择 CSV 文件
              </span>
              <p className="text-gray-500 text-sm mt-2">或拖拽文件到此处</p>
            </label>
            {file && (
              <p className="text-green-600 mt-4">✓ 已选择: {file.name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>预览（前 5 行）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(preview[0]).map(key => (
                      <th key={key} className="text-left py-2 px-4">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="py-2 px-4 truncate max-w-xs">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {file && !result && (
        <div className="mb-8">
          <Button
            onClick={handleImport}
            disabled={importing}
            size="lg"
            className="w-full"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导入中...
              </>
            ) : (
              "开始导入"
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>导入结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>成功导入: {result.imported} 条产品</span>
              </div>
              {result.failed > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>导入失败: {result.failed} 条产品</span>
                </div>
              )}

              {result.results.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">成功导入的产品：</h3>
                  <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">ASIN</th>
                          <th className="text-left py-2">等级</th>
                          <th className="text-right py-2">总分</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((item: any) => (
                          <tr key={item.asin} className="border-b">
                            <td className="py-2 font-mono text-xs">
                              {item.asin}
                            </td>
                            <td className="py-2">
                              <span
                                className={`inline-block px-2 py-1 rounded text-white text-xs font-bold ${
                                  item.grade === "A"
                                    ? "bg-green-600"
                                    : item.grade === "B"
                                      ? "bg-blue-600"
                                      : item.grade === "C"
                                        ? "bg-amber-600"
                                        : "bg-red-600"
                                }`}
                              >
                                {item.grade}
                              </span>
                            </td>
                            <td className="py-2 text-right font-bold">
                              {item.totalScore}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3 text-red-600">
                    导入失败的产品：
                  </h3>
                  <div className="bg-red-50 p-4 rounded max-h-96 overflow-y-auto">
                    {result.errors.map((error: any, idx: number) => (
                      <div key={idx} className="text-sm text-red-700 mb-2">
                        <strong>第 {error.row} 行</strong>
                        {error.field && <>，字段 {error.field}</>}：
                        {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Button onClick={() => window.location.reload()}>
                  导入更多产品
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  查看看板
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
