
import React from 'react';
import { Link } from 'react-router-dom';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowRight, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <TelegramLayout>
      <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-right">
              הדף לא נמצא
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-right">
              הדף שחיפשת לא קיים או שהכתובת שגויה.
            </p>
            <p className="text-sm text-muted-foreground text-right">
              קוד שגיאה: 404
            </p>
            
            <div className="flex flex-col gap-3 mt-6">
              <Button asChild className="w-full">
                <Link to="/" className="flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  חזור לעמוד הבית
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/inventory" className="flex items-center justify-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  לך למלאי
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/dashboard" className="flex items-center justify-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  לך ללוח הבקרה
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TelegramLayout>
  );
}
