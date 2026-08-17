import React from 'react';
import { OverviewCard } from '@/components/ui/product/overview-card';
import { ProductActivity } from '@/components/ui/product/product-activity';
import { ProductViews } from '@/components/ui/product/product-views';
import { Activity, ShoppingBag, MessageSquare, Heart, ExternalLink, ArrowUpDown } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const products = [
  { name: "Croydon - NHT UK kit", price: "$2,453.80", image: "/picture/pic8.jpg", status: "Active" },
  { name: "Bento Matte 3D illustration 1.0", price: "$105.60", image: "/picture/pic7.jpg", status: "Deactive" },
  { name: "Excellent material 3D chair", price: "$648.60", image: "/picture/pic6.jpg", status: "Active" },
  { name: "Fleet - travel shopping kit", price: "$648.60", image: "/picture/pic5.jpg", status: "Active" },
];

const comments = [
  { name: "Ethel", handle: "@ethel", text: "Great work 👏", product: "Smiles - 3D icons", image: "/picture/lisa.PNG" },
  { name: "Jazmyn", handle: "@jaz.designer", text: "I need react version asap!", product: "Fleet - Travel shopping", image: "/picture/vatey.jpg" },
  { name: "Ethel", handle: "@ethel", text: "How can I buy only the design?", product: "Smiles - 3D icons", image: "/picture/menghor.jpg" },
];

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold mb-6">
      <div className={`w-4 h-8 ${color} rounded-full`} />
      <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
    </div>
  )
}

export default function DashboardSeller() {
  return (
    <div className="space-y-8 p-6 bg-[#F9FAFB] min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <SectionTitle color="bg-purple-200">Overview</SectionTitle>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            All time
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OverviewCard
            title="Income"
            value="256k"
            change="37.8%"
            changeType="up"
            icon={<Activity className="w-6 h-6" />}
            bgColor="bg-[#E6F4EA]"
            iconBgColor="bg-gray-900"
            chartColor="#34A853"
            chartPath="M 0 30 Q 25 10 50 25 T 100 10"
          />
          <OverviewCard
            title="Customers"
            value="1024"
            change="37.8%"
            changeType="down"
            icon={<ShoppingBag className="w-6 h-6" />}
            bgColor="bg-[#E8F0FE]"
            iconBgColor="bg-gray-900"
            chartColor="#4285F4"
            chartPath="M 0 25 Q 25 35 50 20 T 100 15"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductActivity />
          
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <SectionTitle color="bg-amber-200">Comments</SectionTitle>
            <div className="divide-y divide-gray-50">
              {comments.map((comment, index) => (
                <article key={`${comment.name}-${index}`} className="py-4">
                  <div className="flex gap-3">
                    <Image src={comment.image} alt={comment.name} width={40} height={40} className="size-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1 text-xs leading-5">
                      <div className="flex items-center gap-1">
                        <strong>{comment.name}</strong>
                        <span className="text-muted-foreground">{comment.handle}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">1h</span>
                      </div>
                      <p>On <strong>{comment.product}</strong></p>
                      <p className="mt-1">{comment.text}</p>
                      <div className="mt-3 flex justify-between text-muted-foreground">
                        <MessageSquare className="size-3.5" />
                        <Heart className="size-3.5" />
                        <ExternalLink className="size-3.5" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full rounded-xl">View all</Button>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <ProductViews />
          
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <SectionTitle color="bg-sky-200">Popular products</SectionTitle>
            <div className="mb-2 mt-4 grid grid-cols-[1fr_auto] text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              <span>Products</span><span>Earning</span>
            </div>
            <div className="divide-y divide-gray-50">
              {products.map((product) => (
                <div key={product.name} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 py-3">
                  <Image src={product.image} alt="" width={48} height={48} className="size-12 rounded-lg object-cover" />
                  <p className="text-xs font-semibold leading-5">{product.name}</p>
                  <div className="text-right">
                    <p className="text-xs font-semibold">{product.price}</p>
                    <span className={`text-[10px] ${product.status === "Active" ? "text-green-500" : "text-red-500"}`}>{product.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
              <Link href="/dashboard/products">All products</Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}
