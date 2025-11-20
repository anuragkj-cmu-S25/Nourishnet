import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../utils/auth/AuthContext';
import { tasksAPI } from '../../utils/api';

export function StaffTasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [session]);

  const loadTasks = async () => {
    if (!session?.access_token) return;

    try {
      const data = await tasksAPI.getAll(session.access_token);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !session?.access_token) return;

    try {
      await tasksAPI.create(
        {
          title: newTaskTitle,
          priority: newTaskPriority,
        },
        session.access_token
      );

      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setIsAddModalOpen(false);
      toast.success('Task added successfully');
      loadTasks();
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error(error.message || 'Failed to add task');
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!session?.access_token) return;

    try {
      await tasksAPI.update(taskId, { completed }, session.access_token);
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!session?.access_token) return;

    try {
      await tasksAPI.delete(taskId, session.access_token);
      toast.success('Task deleted');
      loadTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Tasks</h1>
      </div>

      {/* Progress Section */}
      <div className="bg-white px-4 pb-4 border-b border-gray-200">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Overall Progress</span>
            <span className="text-gray-900">{completedCount} of {totalCount} complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <Card
              key={task.id}
              className={`p-4 ${task.completed ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`cursor-pointer block ${
                      task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Delete task"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks yet</p>
            <p className="text-gray-400 mt-2">Create a task to get started</p>
          </div>
        )}
        
        {/* Add Task Button for Desktop - Fixed position on right */}
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="hidden md:flex fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg items-center justify-center z-50"
          style={{ maxWidth: 'calc(448px - 1rem)', right: 'max(1rem, calc(50% - 224px + 1rem))' }}
          aria-label="Add task"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Add Task Button for Mobile - Fixed position */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center"
        aria-label="Add task"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Task Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Enter the task details below.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task description"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}