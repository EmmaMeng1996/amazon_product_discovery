import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye } from "lucide-react";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SortBy = "totalScore" | "price" | "reviewCount" | "newest";

export default function ProductList() {
  const [grade, setGrade] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("0");
  const [maxScore, setMaxScore] = useState<string>("100");
  const [category, setCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("999");
  const [minReviews, setMinReviews] = useState<string>("0");
  const [maxReviews, setMaxReviews] = useState<string>("10000");
  const [sortBy, setSortBy] = useState<SortBy>("totalScore");
  const [page, setPage] = useState(1);

  const { data: allProducts, isLoading } = trpc.product.listProducts.useQuery({});
  
  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!allProducts) return [];
    const cats = new Set(allProducts.map((p: any) => p.product.category));
    return Array.from(cats).sort() as string[];
  }, [allProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = (allProducts as any[]).filter((p: any) => {
      const score = p.score?.totalScore ? parseInt(p.score.totalScore) : 0;
      const price = parseFloat(p.product.price);
      const reviews = p.product.reviewCount;

      // Grade filter
      if (grade !== "all" && p.score?.grade !== grade) return false;

      // Score filter
      if (score < parseInt(minScore) || score > parseInt(maxScore)) return false;

      // Category filter
      if (category !== "all" && p.product.category !== category) return false;

      // Price filter
      if (price < parseFloat(minPrice) || price > parseFloat(maxPrice)) return false;

      // Reviews filter
      if (reviews < parseInt(minReviews) || reviews > parseInt(maxReviews)) return false;

      return true;
    });

    // Sort
    (filtered as any[]).sort((a: any, b: any) => {
      switch (sortBy) {
        case "totalScore":
          return (parseInt(b.score?.totalScore || "0") || 0) - (parseInt(a.score?.totalScore || "0") || 0);
        case "price":
          return parseFloat(a.product.price) - parseFloat(b.product.price);
        case "reviewCount":
          return b.product.reviewCount - a.product.reviewCount;
        case "newest":
          return 0; // Keep original order
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProducts, grade, minScore, maxScore, category, minPrice, maxPrice, minReviews, maxReviews, sortBy]);

  const pageSize = 10;
  const totalPages = Math.ceil((filteredAndSortedProducts as any[]).length / pageSize);
  const paginatedProducts = (filteredAndSortedProducts as any[]).slice((page - 1) * pageSize, page * pageSize);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-amber-100 text-amber-800";
      case "D":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">产品列表</h1>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">推荐等级</label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部等级</SelectItem>
                  <SelectItem value="A">A级 - 强烈推荐</SelectItem>
                  <SelectItem value="B">B级 - 值得关注</SelectItem>
                  <SelectItem value="C">C级 - 可观察</SelectItem>
                  <SelectItem value="D">D级 - 不推荐</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">类目</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类目</SelectItem>
                  {(categories as string[])?.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">排序方式</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalScore">总分 (高到低)</SelectItem>
                  <SelectItem value="price">价格 (低到高)</SelectItem>
                  <SelectItem value="reviewCount">评论数 (高到低)</SelectItem>
                  <SelectItem value="newest">最新</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">结果统计</label>
              <div className="text-2xl font-bold text-blue-600">{(filteredAndSortedProducts as any[]).length}</div>
              <p className="text-sm text-gray-600">个产品</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">评分范围</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  placeholder="最低"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  placeholder="最高"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">价格范围 ($)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="最低"
                />
                <Input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="最高"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">评论数范围</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={minReviews}
                  onChange={(e) => setMinReviews(e.target.value)}
                  placeholder="最低"
                />
                <Input
                  type="number"
                  min="0"
                  value={maxReviews}
                  onChange={(e) => setMaxReviews(e.target.value)}
                  placeholder="最高"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setGrade("all");
                  setMinScore("0");
                  setMaxScore("100");
                  setCategory("all");
                  setMinPrice("0");
                  setMaxPrice("999");
                  setMinReviews("0");
                  setMaxReviews("10000");
                  setSortBy("totalScore");
                  setPage(1);
                }}
                className="w-full"
              >
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">没有找到匹配的产品</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ASIN</TableHead>
                      <TableHead>产品标题</TableHead>
                      <TableHead>类目</TableHead>
                      <TableHead>价格</TableHead>
                      <TableHead>评分</TableHead>
                      <TableHead>总分</TableHead>
                      <TableHead>等级</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((item: any) => (
                      <TableRow key={item.product.asin}>
                        <TableCell className="font-mono text-sm">{item.product.asin}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.product.title}</TableCell>
                        <TableCell className="text-sm">{item.product.category}</TableCell>
                        <TableCell>${item.product.price}</TableCell>
                        <TableCell>{item.product.rating}/5</TableCell>
                        <TableCell className="font-bold">{item.score?.totalScore || "N/A"}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(item.score?.grade || "")}`}>
                            {item.score?.grade || "N/A"}级
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/product/${item.product.asin}`}>
                            <a>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                查看
                              </Button>
                            </a>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  第 {page} / {totalPages} 页，共 {(filteredAndSortedProducts as any[]).length} 个产品
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
