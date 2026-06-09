import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
import {
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
=======
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
>>>>>>> Stashed changes
import Papa from "papaparse";

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const importCsvMutation = trpc.product.importCsv.useMutation();
  const importFileMutation = trpc.product.importFile.useMutation();

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
    setError("");

    const ext = selectedFile.name.toLowerCase().split(".").pop();

    if (ext === "csv") {
      // Parse CSV preview
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          setPreview(results.data.slice(0, 5));
        },
        error: (error: any) => {
          setError(`CSV 解析错误: ${error.message}`);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      setPreview([{ message: `Excel 文件已选择: ${selectedFile.name}` }]);
    } else if (ext === "pdf") {
      setPreview([{ message: `PDF 文件已选择: ${selectedFile.name}` }]);
    } else {
      setError("不支持的文件格式。请使用 CSV、Excel (.xlsx, .xls) 或 PDF。");
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError("");
    try {
      const ext = file.name.toLowerCase().split(".").pop();

      if (ext === "csv") {
        // Parse CSV and import
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results: any) => {
            try {
              const response = await importCsvMutation.mutateAsync({
                data: results.data,
              });
              setResult(response);
              toast.success(`成功导入 ${response.successCount} 个产品`);
            } catch (error) {
              setError(`导入失败: ${error instanceof Error ? error.message : "Unknown error"}`);
              toast.error("导入失败");
            } finally {
              setImporting(false);
            }
          },
          error: (error: any) => {
            setError(`CSV 解析错误: ${error.message}`);
            setImporting(false);
          },
        });
      } else if (ext === "xlsx" || ext === "xls" || ext === "pdf") {
        // Convert file to base64 and send to backend
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const base64 = (event.target?.result as string).split(",")[1];
            const response = await importFileMutation.mutateAsync({
              filename: file.name,
              fileData: base64,
            });
            setResult(response);
            toast.success(`成功从 ${response.format} 导入 ${response.successCount} 个产品`);
          } catch (error) {
<<<<<<< Updated upstream
            alert(
              `导入失败: ${error instanceof Error ? error.message : "Unknown error"}`
            );
=======
            setError(`导入失败: ${error instanceof Error ? error.message : "Unknown error"}`);
            toast.error("导入失败");
>>>>>>> Stashed changes
          } finally {
            setImporting(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
<<<<<<< Updated upstream
      alert(
        `导入失败: ${error instanceof Error ? error.message : "Unknown error"}`
      );
=======
      setError(`导入失败: ${error instanceof Error ? error.message : "Unknown error"}`);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
          <p className="text-gray-700 mb-4">支持的文件格式：</p>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            <li>✓ <strong>CSV</strong> - 英文或中文列名均可</li>
            <li>✓ <strong>Excel</strong> (.xlsx, .xls) - 支持中文列名</li>
            <li>✓ <strong>PDF</strong> - 表格格式识别</li>
          </ul>
          <div className="bg-gray-100 p-4 rounded font-mono text-xs space-y-2">
            <div>
              <p className="mb-2 font-bold">必需字段（英文）：</p>
              <p className="text-gray-700">asin, title, category, price, rating, reviewCount, sellerCount, weight, dimensions, productUrl, keyword</p>
            </div>
            <div>
              <p className="mb-2 font-bold">必需字段（中文）：</p>
              <p className="text-gray-700">ASIN, 商品标题, 小类目, 价格($), 评分, 月新增评分数, 卖家数, 商品重量（单位换算）, 商品尺寸（单位换算）, 商品详情页链接, AC关键词</p>
            </div>
>>>>>>> Stashed changes
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
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
<<<<<<< Updated upstream
            <label htmlFor="csv-input" className="cursor-pointer">
              <span className="text-blue-600 hover:underline">
                点击选择 CSV 文件
              </span>
              <p className="text-gray-500 text-sm mt-2">或拖拽文件到此处</p>
            </label>
            {file && (
              <p className="text-green-600 mt-4">✓ 已选择: {file.name}</p>
=======
            <label htmlFor="file-input" className="cursor-pointer">
              <span className="text-blue-600 hover:underline">点击选择文件</span>
              <p className="text-gray-500 text-sm mt-2">支持 CSV、Excel (.xlsx, .xls)、PDF</p>
            </label>
            {file && (
              <div className="mt-4 text-sm">
                <p className="text-green-600">✓ 已选择: <span className="font-bold">{file.name}</span></p>
                <p className="text-gray-500 text-xs mt-1">文件大小: {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-700 text-sm flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
>>>>>>> Stashed changes
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>数据预览</CardTitle>
          </CardHeader>
          <CardContent>
<<<<<<< Updated upstream
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
=======
            {preview[0]?.message ? (
              <div className="text-center py-4">
                <p className="text-gray-600">{preview[0].message}</p>
                <p className="text-gray-500 text-sm mt-2">点击"开始导入"按钮进行导入</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th key={key} className="text-left py-2 px-4 font-medium">
                          {key}
                        </th>
>>>>>>> Stashed changes
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="py-2 px-4 truncate max-w-xs text-xs">
                            {String(value).substring(0, 100)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <CardTitle>导入完成</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">成功导入</p>
                  <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">总处理</p>
                  <p className="text-2xl font-bold text-blue-600">{result.totalProcessed}</p>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-sm text-gray-600">错误</p>
                  <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
                </div>
              </div>

              {result.format && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="text-gray-600">文件格式: <span className="font-bold">{result.format}</span></p>
                </div>
              )}

              {result.results && result.results.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">成功导入的产品（前 10 条）：</h3>
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
                        {result.results.slice(0, 10).map((item: any) => (
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
<<<<<<< Updated upstream
                            <td className="py-2 text-right font-bold">
                              {item.totalScore}
                            </td>
=======
                            <td className="py-2 text-right font-bold">{item.totalScore || "N/A"}</td>
>>>>>>> Stashed changes
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-6">
<<<<<<< Updated upstream
                  <h3 className="font-medium mb-3 text-red-600">
                    导入失败的产品：
                  </h3>
                  <div className="bg-red-50 p-4 rounded max-h-96 overflow-y-auto">
                    {result.errors.map((error: any, idx: number) => (
                      <div key={idx} className="text-sm text-red-700 mb-2">
                        <strong>第 {error.row} 行</strong>
                        {error.field && <>，字段 {error.field}</>}：
                        {error.error}
=======
                  <h3 className="font-medium mb-3 text-red-600">导入错误：</h3>
                  <div className="bg-red-50 p-4 rounded max-h-96 overflow-y-auto">
                    {result.errors.slice(0, 10).map((error: string, idx: number) => (
                      <div key={idx} className="text-xs text-red-700 mb-2">
                        • {error}
>>>>>>> Stashed changes
                      </div>
                    ))}
                    {result.errors.length > 10 && (
                      <div className="text-xs text-red-700 mt-2">
                        ... 还有 {result.errors.length - 10} 个错误
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Button onClick={() => {
                  setFile(null);
                  setPreview([]);
                  setResult(null);
                  setError("");
                }}>
                  导入新文件
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
