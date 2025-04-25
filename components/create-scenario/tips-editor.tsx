"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TipsEditorProps {
  tips: string[];
  onTipsChange: (tips: string[]) => void;
}

export function TipsEditor({ tips, onTipsChange }: TipsEditorProps) {
  const [newTip, setNewTip] = useState("");

  const addTip = () => {
    if (newTip.trim()) {
      onTipsChange([...tips, newTip.trim()]);
      setNewTip("");
    }
  };

  const removeTip = (index: number) => {
    onTipsChange(tips.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Success Tips</CardTitle>
        <CardDescription>
          Add helpful tips for successfully navigating this conversation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Current Tips</Label>
            <ul className="mt-2 space-y-2">
              {tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-md"
                >
                  <span>{tip}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTip(index)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Add a new tip..."
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTip();
                  }
                }}
              />
            </div>
            <Button onClick={addTip} disabled={!newTip.trim()}>
              Add Tip
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
