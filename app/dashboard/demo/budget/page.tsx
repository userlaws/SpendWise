'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { mockCategories } from '@/lib/data';
import { calculatePercentage, formatCurrency } from '@/lib/utils';
import { Edit, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

export default function BudgetPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const { toast } = useToast();

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalPercentage = calculatePercentage(totalSpent, totalBudget);

  const handleEditClick = (categoryId: string, currentBudget: number) => {
    setEditingCategory(categoryId);
    setEditValue(currentBudget);
  };

  const handleSaveClick = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, budget: editValue } : cat
      )
    );
    setEditingCategory(null);

    toast({
      title: 'Budget Updated',
      description: 'Your budget has been updated successfully.',
    });
  };

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const { data, error } = await supabase.from('budget').select('*');
        if (error) throw error;
        // Handle budget data...
      } catch (error) {
        console.error('Error fetching budget data:', error);
      }
    };
    fetchBudgetData();
  }, []);

  return (
    <div className='flex flex-col p-4 md:p-8 gap-6'>
      <div className='flex flex-col md:flex-row items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold'>Budget Settings</h1>
          <p className='text-muted-foreground'>
            Manage your monthly spending limits
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget Overview</CardTitle>
          <CardDescription>
            Your total budget and spending progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Total Budget</span>
              <span className='text-sm font-medium'>
                {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
              </span>
            </div>
            <Progress
              value={totalPercentage}
              className='h-2'
              indicatorClassName={
                totalPercentage > 90
                  ? 'bg-destructive'
                  : totalPercentage > 75
                  ? 'bg-secondary'
                  : ''
              }
            />
            <p className='text-xs text-muted-foreground mt-1'>
              {totalPercentage >= 100
                ? "You've exceeded your total budget"
                : `${100 - totalPercentage}% of your budget remaining`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>
            Set spending limits for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {categories.map((category) => {
              const percentage = calculatePercentage(
                category.spent,
                category.budget
              );
              const isOverBudget = category.spent > category.budget;

              return (
                <div key={category.id} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: category.color }}
                      />
                      <span className='font-medium'>{category.name}</span>
                    </div>

                    <div className='flex items-center gap-2'>
                      {editingCategory === category.id ? (
                        <>
                          <div className='flex items-center gap-2'>
                            <Input
                              type='number'
                              value={editValue}
                              onChange={(e) =>
                                setEditValue(Number(e.target.value))
                              }
                              className='w-24 h-8'
                            />
                            <Button
                              size='icon'
                              variant='ghost'
                              onClick={() => handleSaveClick(category.id)}
                            >
                              <Save className='h-4 w-4' />
                              <span className='sr-only'>Save</span>
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span
                            className={
                              isOverBudget ? 'text-destructive font-medium' : ''
                            }
                          >
                            {formatCurrency(category.spent)} /{' '}
                            {formatCurrency(category.budget)}
                          </span>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() =>
                              handleEditClick(category.id, category.budget)
                            }
                          >
                            <Edit className='h-4 w-4' />
                            <span className='sr-only'>Edit</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <Progress
                    value={percentage}
                    className='h-2'
                    indicatorClassName={isOverBudget ? 'bg-destructive' : ''}
                  />

                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>
                      {isOverBudget
                        ? `Exceeded by ${formatCurrency(
                            category.spent - category.budget
                          )}`
                        : `${formatCurrency(
                            category.budget - category.spent
                          )} remaining`}
                    </span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
