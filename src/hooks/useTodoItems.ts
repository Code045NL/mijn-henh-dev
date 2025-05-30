
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { TodoItem } from '@/types/todo';

export function useTodoItems(propertyId?: string) {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const { toast } = useToast();

  const fetchTodoItems = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('todo_items')
        .select(`
          *,
          property:property_id(id, title),
          assigned_to:assigned_to_id(*)
        `)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      // If propertyId is provided, filter by it
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
        
      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match TodoItem interface with proper handling of assigned_to
      const transformedItems = data.map((item: any): TodoItem => {
        // For assigned_to, check if it exists and has valid properties
        let assignedTo = undefined;
        if (item.assigned_to && typeof item.assigned_to === 'object' && !('error' in item.assigned_to)) {
          // Create a display name from available fields
          const displayName = item.assigned_to.display_name || 
                             (item.assigned_to.user_id ? `User ${item.assigned_to.user_id.substring(0, 8)}` : 'Unnamed User');
          
          assignedTo = {
            id: item.assigned_to.id,
            full_name: displayName
          };
        }
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          due_date: item.due_date,
          completed: item.completed,
          property_id: item.property_id,
          assigned_to_id: item.assigned_to_id,
          notify_at: item.notify_at,
          notification_sent: item.notification_sent,
          created_at: item.created_at,
          updated_at: item.updated_at,
          sort_order: item.sort_order,
          property: item.property,
          assigned_to: assignedTo
        };
      });
      
      setTodoItems(transformedItems);
    } catch (error) {
      console.error('Error fetching todo items:', error);
      toast({
        title: "Error",
        description: "Failed to load todo items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, toast]);

  useEffect(() => {
    fetchTodoItems();
    
    // Set up real-time subscription for updates to todo_items
    const channel = supabase
      .channel('todo_items_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'todo_items',
        ...(propertyId ? { filter: `property_id=eq.${propertyId}` } : {})
      }, () => {
        fetchTodoItems();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodoItems, propertyId]);

  const addTodoItem = async (todoData: Omit<TodoItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('todo_items')
        .insert(todoData);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Todo item added successfully",
      });
      
      return fetchTodoItems();
    } catch (error) {
      console.error('Error adding todo item:', error);
      toast({
        title: "Error",
        description: "Failed to add todo item",
        variant: "destructive",
      });
    }
  };

  const updateTodoItem = async (id: string, todoData: Partial<Omit<TodoItem, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { error } = await supabase
        .from('todo_items')
        .update(todoData)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Todo item updated successfully",
      });
      
      return fetchTodoItems();
    } catch (error) {
      console.error('Error updating todo item:', error);
      toast({
        title: "Error",
        description: "Failed to update todo item",
        variant: "destructive",
      });
    }
  };

  const deleteTodoItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todo_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Todo item deleted successfully",
      });
      
      return fetchTodoItems();
    } catch (error) {
      console.error('Error deleting todo item:', error);
      toast({
        title: "Error",
        description: "Failed to delete todo item",
        variant: "destructive",
      });
    }
  };

  const markTodoItemComplete = async (id: string, completed: boolean) => {
    return updateTodoItem(id, { completed });
  };

  const updateTodoOrder = async (reorderedItems: TodoItem[]) => {
    try {
      // Create an array of updates
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        sort_order: index
      }));
      
      // Update each item
      for (const update of updates) {
        const { error } = await supabase
          .from('todo_items')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      return fetchTodoItems();
    } catch (error) {
      console.error('Error updating todo order:', error);
      toast({
        title: "Error",
        description: "Failed to update todo order",
        variant: "destructive",
      });
    }
  };

  return {
    todoItems,
    isLoading,
    showCompleted,
    setShowCompleted,
    addTodoItem,
    updateTodoItem,
    deleteTodoItem,
    markTodoItemComplete,
    updateTodoOrder,
    fetchTodoItems
  };
}
