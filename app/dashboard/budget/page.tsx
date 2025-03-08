'use client';

import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';
import { Edit, Plus, Save, X } from 'lucide-react';
import { BudgetCategoryForm } from '@/components/budget-category-form';

interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
}

export default function BudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const { toast } = useToast();

  const fetchBudgetData = async () => {
    try {
      setIsLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error('No active session found');
        window.location.href = '/login';
        return;
      }

      try {
        const { data, error } = await supabase
          .from('budget_categories')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) throw error;

        const formattedCategories =
          data?.map((item) => ({
            id: item.category_id || item.id,
            name: item.category_name || item.name,
            budget: item.budget_amount || item.budget || 0,
            spent: item.spent_amount || item.spent || 0,
          })) || [];

        setCategories(formattedCategories);

        // Calculate totals
        const budgetTotal = formattedCategories.reduce(
          (sum, cat) => sum + cat.budget,
          0
        );
        const spentTotal = formattedCategories.reduce(
          (sum, cat) => sum + cat.spent,
          0
        );

        setTotalBudget(budgetTotal);
        setTotalSpent(spentTotal);
      } catch (error) {
        console.log('Budget categories table may not exist yet');
        setCategories([]);
        setTotalBudget(0);
        setTotalSpent(0);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load budget data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const handleEditClick = (categoryId: string, currentBudget: number) => {
    setEditingCategory(categoryId);
    setEditValue(currentBudget.toString());
  };

  const handleSaveClick = async (categoryId: string) => {
    try {
      const budgetAmount = parseFloat(editValue);

      if (isNaN(budgetAmount) || budgetAmount < 0) {
        toast({
          title: 'Invalid budget',
          description: 'Please enter a valid budget amount',
          variant: 'destructive',
        });
        return;
      }

      // Update the budget in Supabase
      const { error } = await supabase
        .from('budget_categories')
        .update({ budget_amount: budgetAmount })
        .eq('category_id', categoryId);

      if (error) throw error;

      // Update the local state
      const updatedCategories = categories.map((category) =>
        category.id === categoryId
          ? { ...category, budget: budgetAmount }
          : category
      );

      setCategories(updatedCategories);

      // Recalculate total budget
      const newTotalBudget = updatedCategories.reduce(
        (sum, cat) => sum + cat.budget,
        0
      );
      setTotalBudget(newTotalBudget);

      // Reset editing state
      setEditingCategory(null);

      toast({
        title: 'Budget Updated',
        description: 'Your budget has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to update budget',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  // Calculate percentages for each category
  const categoriesWithPercentage = categories.map((category) => {
    const percentSpent =
      category.budget > 0
        ? Math.min(100, (category.spent / category.budget) * 100)
        : 0;
    const isOverBudget = category.spent > category.budget;

    return {
      ...category,
      percentSpent,
      isOverBudget,
    };
  });

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Budget</h1>
          <p className='text-muted-foreground'>Manage your monthly budget</p>
        </div>

        <BudgetCategoryForm onSuccess={fetchBudgetData} />
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalBudget)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Monthly budget allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalSpent)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {totalBudget > 0
                ? `${Math.round(
                    (totalSpent / totalBudget) * 100
                  )}% of budget used`
                : 'No budget set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(Math.max(0, totalBudget - totalSpent))}
            </div>
            <p className='text-xs text-muted-foreground'>Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <p>Loading budget data...</p>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-10'>
            <p className='text-muted-foreground mb-4'>
              No budget categories found
            </p>
            <BudgetCategoryForm
              onSuccess={fetchBudgetData}
              trigger={
                <Button>
                  <Plus className='mr-2 h-4 w-4' /> Create Your First Budget
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>Track spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {categoriesWithPercentage.map((category) => (
                <div key={category.id} className='space-y-2'>
                  <div className='flex justify-between'>
                    <div>
                      <span className='font-medium'>{category.name}</span>
                    </div>

                    {editingCategory === category.id ? (
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium mr-1'>$</span>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className='w-24 h-8 text-right'
                          autoFocus
                        />
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={() => handleSaveClick(category.id)}
                          className='h-8 w-8'
                        >
                          <Save className='h-4 w-4' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={handleCancelEdit}
                          className='h-8 w-8'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <span
                          className={
                            category.isOverBudget
                              ? 'text-red-500 font-medium'
                              : 'font-medium'
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
                          className='h-8 w-8'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>

                  <Progress
                    value={category.percentSpent}
                    className='h-2'
                    indicatorClassName={
                      category.isOverBudget ? 'bg-red-500' : undefined
                    }
                  />
                  <p className='text-xs text-muted-foreground'>
                    {category.percentSpent.toFixed(0)}% of budget used
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
