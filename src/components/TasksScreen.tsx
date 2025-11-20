import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TasksScreen() {
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Sort food by category', completed: false },
    { id: '2', title: 'Create sourcing list for tomorrow', completed: false },
    { id: '3', title: 'Review delivery schedule', completed: false },
    { id: '4', title: 'Update inventory counts', completed: false },
    { id: '5', title: 'Contact volunteers for next week', completed: false },
    { id: '6', title: 'Check refrigerator temperatures', completed: true },
    { id: '7', title: 'Submit weekly report', completed: true },
  ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    toast.success('Task updated');
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setIsAddModalOpen(false);
      toast.success('Task added successfully');
    }
  };

  const todoTasks = tasks.filter(task => !task.completed);
  const doneTasks = tasks.filter(task => task.completed);
  const displayedTasks = activeTab === 'todo' ? todoTasks : doneTasks;
  
  // Calculate completion percentage
  const completionPercentage = tasks.length > 0 
    ? Math.round((doneTasks.length / tasks.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Tasks</h1>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm text-gray-900">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
        <p className="text-xs text-gray-500 mt-2">
          {doneTasks.length} of {tasks.length} tasks completed
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white px-4 pb-3 border-b border-gray-200">
        {/* Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 mb-3">
          <button
            onClick={() => setActiveTab('todo')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'todo'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            To-Do ({todoTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'done'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Done ({doneTasks.length})
          </button>
        </div>

        {/* Add Task Button */}
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-2">
        <div className="space-y-3">
          {displayedTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">
                {activeTab === 'todo' ? 'No pending tasks' : 'No completed tasks'}
              </p>
            </Card>
          ) : (
            displayedTasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor={task.id}
                    className={`flex-1 cursor-pointer ${
                      task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </label>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="task-title">Task Description</Label>
            <Input
              id="task-title"
              type="text"
              placeholder="Enter task description"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={addTask}
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
