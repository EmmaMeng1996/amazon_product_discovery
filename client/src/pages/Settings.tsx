import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { data: rules, isLoading } = trpc.product.getScoringRules.useQuery();
  const updateMutation = trpc.product.updateScoringRules.useMutation();
  const recalculateMutation = trpc.product.recalculateAllScores.useMutation();

  const [formData, setFormData] = useState({
    minPrice: "",
    maxPrice: "",
    minReviewCount: "",
    maxReviewCount: "",
    maxWeight: "",
    competitionWeight: "",
    profitWeight: "",
    differentiationWeight: "",
    developmentWeight: "",
  });

  useEffect(() => {
    if (rules) {
      setFormData({
        minPrice: String(rules.minPrice),
        maxPrice: String(rules.maxPrice),
        minReviewCount: String(rules.minReviewCount),
        maxReviewCount: String(rules.maxReviewCount),
        maxWeight: String(rules.maxWeight),
        competitionWeight: String(rules.competitionWeight),
        profitWeight: String(rules.profitWeight),
        differentiationWeight: String(rules.differentiationWeight),
        developmentWeight: String(rules.developmentWeight),
      });
    }
  }, [rules]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        minPrice: Number(formData.minPrice),
        maxPrice: Number(formData.maxPrice),
        minReviewCount: Number(formData.minReviewCount),
        maxReviewCount: Number(formData.maxReviewCount),
        maxWeight: Number(formData.maxWeight),
        competitionWeight: Number(formData.competitionWeight),
        profitWeight: Number(formData.profitWeight),
        differentiationWeight: Number(formData.differentiationWeight),
        developmentWeight: Number(formData.developmentWeight),
      });
      toast.success("规则已保存");
    } catch (error) {
      toast.error("保存失败");
    }
  };

  const handleRecalculate = async () => {
    try {
      const result = await recalculateMutation.mutateAsync();
      toast.success(`已重新评分 ${result.updated} 个产品`);
    } catch (error) {
      toast.error("重新评分失败");
    }
  };

  const totalWeight =
    Number(formData.competitionWeight) +
    Number(formData.profitWeight) +
    Number(formData.differentiationWeight) +
    Number(formData.developmentWeight);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">评分规则配置</h1>

      {/* Hard Filter Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>硬过滤条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">最低价格 ($)</label>
              <Input
                type="number"
                value={formData.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">最高价格 ($)</label>
              <Input
                type="number"
                value={formData.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">最低评论数</label>
              <Input
                type="number"
                value={formData.minReviewCount}
                onChange={(e) => handleInputChange("minReviewCount", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">最高评论数</label>
              <Input
                type="number"
                value={formData.maxReviewCount}
                onChange={(e) => handleInputChange("maxReviewCount", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">最大重量 (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.maxWeight}
                onChange={(e) => handleInputChange("maxWeight", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Weights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>评分权重配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">竞争度权重</label>
              <Input
                type="number"
                step="0.1"
                value={formData.competitionWeight}
                onChange={(e) => handleInputChange("competitionWeight", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">满分 25</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">利润空间权重</label>
              <Input
                type="number"
                step="0.1"
                value={formData.profitWeight}
                onChange={(e) => handleInputChange("profitWeight", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">满分 25</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">差异化权重</label>
              <Input
                type="number"
                step="0.1"
                value={formData.differentiationWeight}
                onChange={(e) => handleInputChange("differentiationWeight", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">满分 30</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">开发难度权重</label>
              <Input
                type="number"
                step="0.1"
                value={formData.developmentWeight}
                onChange={(e) => handleInputChange("developmentWeight", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">满分 20</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded mb-6">
            <p className="text-sm">
              <strong>权重总和:</strong> {totalWeight.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {totalWeight === 100 ? "✓ 权重配置正确" : "⚠ 权重总和应为 100"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={updateMutation.isPending} size="lg">
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存规则
            </>
          )}
        </Button>

        <Button
          onClick={handleRecalculate}
          disabled={recalculateMutation.isPending}
          variant="outline"
          size="lg"
        >
          {recalculateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              重新评分中...
            </>
          ) : (
            "重新评分所有产品"
          )}
        </Button>
      </div>

      {/* Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>说明</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>硬过滤条件</strong>：不符合条件的产品将被标记为 D 级（不推荐）</li>
            <li>• <strong>评分权重</strong>：调整各维度的权重可改变最终推荐等级的分布</li>
            <li>• <strong>重新评分</strong>：修改规则后，点击此按钮重新计算所有产品的评分</li>
            <li>• 权重总和应为 100，系统会自动归一化处理</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
