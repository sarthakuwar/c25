"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send } from "lucide-react"
import { Input } from "@/components/ui/input"

type Props = {
  cardClass: string
  shop: { shopName: string }
}

export default function CenterMessages({ cardClass, shop }: Props) {
  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Messages</h2>
          <MessageSquare className="h-5 w-5 text-white/70" />
        </div>
        <p className="text-white/60 text-sm mt-1">Internal messages for {shop.shopName}</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className={`${cardClass} p-5`}>
          <p className="text-white/70 text-sm mb-3">Recent</p>
          <div className="space-y-3">
            {["Shift changes posted", "Reminder: safety checklist", "New inventory arrived"].map((m, i) => (
              <div key={i} className="p-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm">
                {m}
              </div>
            ))}
          </div>
        </Card>
        <Card className={`${cardClass} p-5`}>
          <p className="text-white/70 text-sm mb-3">Send a message</p>
          <div className="flex items-center gap-2">
            <Input placeholder="Type your message..." className="flex-1 bg-black/40 border-white/20 text-white placeholder:text-white/40" />
            <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
