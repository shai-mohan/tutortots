"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Gift, ShoppingBag, Car, Utensils, Film, BookOpen, Coins, Ticket, Clock } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Reward {
  id: string
  title: string
  description: string
  brand: string
  value_rm: number
  points_required: number
  category: string
  image_url?: string
  terms_conditions: string
  stock_quantity: number
}

interface Redemption {
  id: string
  voucher_code: string
  status: string
  expires_at: string
  redeemed_at: string
  reward: {
    title: string
    brand: string
    value_rm: number
  }
}

interface PointsTransaction {
  id: string
  transaction_type: string
  points_amount: number
  description: string
  created_at: string
}

const CATEGORY_ICONS = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  education: BookOpen,
}

const CATEGORY_COLORS = {
  food: "bg-orange-100 text-orange-600",
  transport: "bg-blue-100 text-blue-600",
  shopping: "bg-purple-100 text-purple-600",
  entertainment: "bg-pink-100 text-pink-600",
  education: "bg-green-100 text-green-600",
}

export default function StudentRewards() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [showRedeemDialog, setShowRedeemDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/")
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch available rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_required")

      if (rewardsError) {
        console.error("Error fetching rewards:", rewardsError)
      } else {
        setRewards(rewardsData || [])
      }

      // Fetch user's redemptions
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from("rewards_redemptions")
        .select(`
          *,
          rewards (title, brand, value_rm)
        `)
        .eq("user_id", user!.id)
        .order("redeemed_at", { ascending: false })

      if (redemptionsError) {
        console.error("Error fetching redemptions:", redemptionsError)
      } else {
        setRedemptions(
          redemptionsData?.map((item: any) => ({
            id: item.id,
            voucher_code: item.voucher_code,
            status: item.status,
            expires_at: item.expires_at,
            redeemed_at: item.redeemed_at,
            reward: {
              title: item.rewards.title,
              brand: item.rewards.brand,
              value_rm: item.rewards.value_rm,
            },
          })) || [],
        )
      }

      // Fetch points transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("points_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError)
      } else {
        setTransactions(transactionsData || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (!selectedReward) return

    setRedeeming(true)
    try {
      const { data, error } = await supabase.rpc("redeem_reward", {
        reward_uuid: selectedReward.id,
        user_uuid: user!.id,
      })

      if (error) {
        toast({
          title: "Redemption Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      const result = data as { success: boolean; message?: string; voucher_code?: string; reward_title?: string }

      if (result.success) {
        toast({
          title: "Redemption Successful!",
          description: `Your voucher code is: ${result.voucher_code}`,
        })

        // Refresh data
        fetchData()
        setShowRedeemDialog(false)
        setSelectedReward(null)
      } else {
        toast({
          title: "Redemption Failed",
          description: result.message || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error redeeming reward:", error)
      toast({
        title: "Redemption Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setRedeeming(false)
    }
  }

  const filteredRewards = rewards.filter((reward) => selectedCategory === "all" || reward.category === selectedCategory)

  const categories = ["all", ...Array.from(new Set(rewards.map((r) => r.category)))]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-dark-blue-gray">Rewards Center</h1>
                <p className="text-sm text-blue-gray">Redeem your points for amazing vouchers</p>
              </div>
            </div>
            <Card className="bg-orange text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Coins className="h-8 w-8" />
                <div>
                  <div className="text-2xl font-bold">{user.points || 0}</div>
                  <div className="text-sm opacity-90">Points Available</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="rewards" className="data-[state=active]:bg-orange data-[state=active]:text-orange-500">
              <Gift className="h-4 w-4 mr-2" />
              Available Rewards
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="data-[state=active]:bg-orange data-[state=active]:text-orange-500">
              <Ticket className="h-4 w-4 mr-2" />
              My Vouchers
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-orange data-[state=active]:text-orange-500">
              <Clock className="h-4 w-4 mr-2" />
              Points History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards">
            <div className="space-y-6">
              {/* Category Filter */}
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={
                          selectedCategory === category
                            ? "bg-orange hover:bg-orange text-white"
                            : "border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                        }
                      >
                        {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-blue-gray">Loading rewards...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRewards.map((reward) => {
                    const IconComponent = CATEGORY_ICONS[reward.category as keyof typeof CATEGORY_ICONS] || Gift
                    const colorClass =
                      CATEGORY_COLORS[reward.category as keyof typeof CATEGORY_COLORS] || "bg-gray-100 text-gray-600"
                    const canAfford = (user.points || 0) >= reward.points_required
                    const inStock = reward.stock_quantity === -1 || reward.stock_quantity > 0

                    return (
                      <Card key={reward.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <Badge variant="outline" className="text-orange border-orange">
                              RM{reward.value_rm}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-dark-blue-gray">{reward.title}</CardTitle>
                          <CardDescription className="text-blue-gray">{reward.brand}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-blue-gray">{reward.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-orange" />
                              <span className="font-medium text-dark-blue-gray">{reward.points_required} points</span>
                            </div>
                            {reward.stock_quantity > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {reward.stock_quantity} left
                              </Badge>
                            )}
                          </div>

                          <Button
                            className="w-full bg-orange hover:bg-orange text-white"
                            disabled={!canAfford || !inStock}
                            onClick={() => {
                              setSelectedReward(reward)
                              setShowRedeemDialog(true)
                            }}
                          >
                            {!inStock ? "Out of Stock" : !canAfford ? "Insufficient Points" : "Redeem Now"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vouchers">
            <div className="space-y-4">
              {redemptions.length === 0 ? (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="text-center py-12">
                    <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-blue-gray mb-2">No vouchers yet</h3>
                    <p className="text-blue-gray">Redeem rewards to get your first voucher!</p>
                  </CardContent>
                </Card>
              ) : (
                redemptions.map((redemption) => (
                  <Card key={redemption.id} className="border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-dark-blue-gray">{redemption.reward.title}</h3>
                          <p className="text-sm text-blue-gray">
                            {redemption.reward.brand} • RM{redemption.reward.value_rm}
                          </p>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                              {redemption.voucher_code}
                            </div>
                            <Badge
                              variant={redemption.status === "active" ? "default" : "secondary"}
                              className={redemption.status === "active" ? "bg-green-100 text-green-600" : ""}
                            >
                              {redemption.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-blue-gray">
                          <div>Expires: {formatDate(redemption.expires_at)}</div>
                          <div>Redeemed: {formatDate(redemption.redeemed_at)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-dark-blue-gray">Points History</CardTitle>
                <CardDescription className="text-blue-gray">Your recent points transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-gray">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-dark-blue-gray">{transaction.description}</p>
                          <p className="text-xs text-blue-gray">{formatDate(transaction.created_at)}</p>
                        </div>
                        <div
                          className={`font-semibold ${transaction.transaction_type === "earned" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.transaction_type === "earned" ? "+" : ""}
                          {transaction.points_amount} points
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>Are you sure you want to redeem this reward?</DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-dark-blue-gray">{selectedReward.title}</h3>
                <p className="text-sm text-blue-gray">
                  {selectedReward.brand} • RM{selectedReward.value_rm}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <Coins className="h-4 w-4 text-orange" />
                  <span className="font-medium">{selectedReward.points_required} points</span>
                </div>
              </div>

              <div className="text-sm text-blue-gray">
                <p className="font-medium mb-1">Terms & Conditions:</p>
                <p>{selectedReward.terms_conditions}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                  onClick={() => setShowRedeemDialog(false)}
                  disabled={redeeming}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-orange hover:bg-orange text-white"
                  onClick={handleRedeem}
                  disabled={redeeming}
                >
                  {redeeming ? "Redeeming..." : "Confirm Redeem"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
