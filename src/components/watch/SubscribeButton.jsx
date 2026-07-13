import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff } from "lucide-react";

export default function SubscribeButton({ user, creatorId, creatorName }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user || !creatorId) return;
    const list = await base44.entities.Subscription.filter({ subscriber_id: user.id, creator_id: creatorId });
    setSubscription(list[0] || null);
  }, [user, creatorId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user || !creatorId || user.id === creatorId) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      if (subscription) {
        await base44.entities.Subscription.delete(subscription.id);
      } else {
        await base44.entities.Subscription.create({
          subscriber_id: user.id,
          creator_id: creatorId,
          creator_name: creatorName || "",
        });
      }
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={subscription ? "outline" : "default"} size="sm" className="gap-2" onClick={toggle} disabled={loading}>
      {subscription ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
      {subscription ? "Subscribed" : "Subscribe"}
    </Button>
  );
}