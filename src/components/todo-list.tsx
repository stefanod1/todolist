"use client"

import { useState, useEffect } from "react"
import { Todo, todoService } from "@/lib/todo"
import { cn } from "@/lib/utils"

export default function TodoList() {
  const [tasks, setTasks] = useState<Todo[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks from Firebase
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const todos = await todoService.getTodos()
        setTasks(todos)
      } catch (error) {
        console.error("Error loading tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  const addTask = async () => {
    if (newTaskText.trim() === "") return

    try {
      const newTask = await todoService.createTodo(newTaskText)
      setTasks([newTask, ...tasks])
      setNewTaskText("")
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await todoService.deleteTodo(id)
      setTasks(tasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const toggleTaskCompletion = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id)
      if (!task) return

      await todoService.updateTodo(id, { completed: !task.completed })
      setTasks(tasks.map((task) => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ))
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const startEditing = (task: Todo) => {
    setEditingTaskId(task.id)
    setEditingText(task.text)
  }

  const saveEdit = async () => {
    if (editingTaskId === null) return

    try {
      await todoService.updateTodo(editingTaskId, { text: editingText })
      setTasks(tasks.map((task) => 
        task.id === editingTaskId ? { ...task, text: editingText } : task
      ))
      setEditingTaskId(null)
      setEditingText("")
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
    setEditingText("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Todo List App</h1>
          <p className="text-slate-300">Manage your tasks efficiently</p>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 max-w-2xl">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask()
            }}
            className="flex-grow border rounded p-2"
          />
          <button 
            onClick={addTask} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tasks yet. Add some tasks to get started!</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-2 p-3 border rounded-lg transition-colors",
                  task.completed ? "bg-slate-50" : "bg-white"
                )}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  id={`task-${task.id}`}
                  className="h-4 w-4"
                />

                {editingTaskId === task.id ? (
                  <div className="flex-grow flex gap-2">
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-grow border rounded p-1"
                      autoFocus
                    />
                    <button 
                      onClick={saveEdit} 
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={cancelEdit} 
                      className="bg-gray-300 px-2 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        "flex-grow cursor-pointer",
                        task.completed && "line-through text-slate-500"
                      )}
                    >
                      {task.text}
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(task)}
                        disabled={task.completed}
                        className="text-blue-500 p-1 disabled:text-gray-300 hover:text-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)} 
                        className="text-red-500 p-1 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="bg-slate-100 p-4 border-t">
        <div className="container mx-auto text-center text-sm text-slate-500">
          <p>Todo List App &copy; {new Date().getFullYear()}</p>
          <p>Keep track of your tasks and boost your productivity</p>
        </div>
      </footer>
    </div>
  )
}
