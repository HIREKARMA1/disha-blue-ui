"use client"

import React, { useState, useRef, useEffect } from 'react'
import { 
  Play, Square, Download, Upload, Settings, CheckCircle, AlertCircle, RotateCcw,
  Terminal, Maximize2, Minimize2, Split, FileText, Code2, Zap, Clock,
  ChevronDown, ChevronRight, Eye, EyeOff, Copy, Trash2, Save, TestTube
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import MonacoEditor from '@monaco-editor/react'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { apiClient } from '@/lib/api'
import { useCodingValidation } from '@/hooks/useCodingValidation'
import { TestCasesDisplay } from './TestCasesDisplay'
import { TestResultsPopup } from './TestResultsPopup'
import { Question, TestCase } from '@/types/practice'
import toast from 'react-hot-toast'

// Language configurations
const LANGUAGES = [
  { id: 'python', label: 'Python', extension: 'py', defaultCode: '# Write your solution here\ndef add_two_numbers(a, b):\n  return a + b\n\n# Test the function\nprint(add_two_numbers(5, 3))' },
  { id: 'java', label: 'Java', extension: 'java', defaultCode: 'public class Solution {\n  public int addTwoNumbers(int a, int b) {\n  return a + b;\n  }\n  \n  public static void main(String[] args) {\n  Solution solution = new Solution();\n  System.out.println(solution.addTwoNumbers(5, 3));\n  }\n}' },
  { id: 'cpp', label: 'C++', extension: 'cpp', defaultCode: '#include <iostream>\nusing namespace std;\n\nint addTwoNumbers(int a, int b) {\n  return a + b;\n}\n\nint main() {\n  cout << addTwoNumbers(5, 3) << endl;\n  return 0;\n}' },
  { id: 'javascript', label: 'JavaScript', extension: 'js', defaultCode: '// Write your solution here\nfunction addTwoNumbers(a, b) {\n  return a + b;\n}\n\n// Test the function\nconsole.log(addTwoNumbers(5, 3));' }
]

// Monaco Editor language mappings
const MONACO_LANGUAGES = {
  python: 'python',
  cpp: 'cpp',
  java: 'java',
  javascript: 'javascript'
}

interface ExecutionResult {
  stdout: string
  stderr: string
  runtime: number
  memory: number
  status: string
}

interface TestResult {
  passed: boolean
  actualOutput?: string
  error?: string
}

interface CodingIDEProps {
  questionId: string
  question?: Question // Optional question object with test cases
  initialCode?: string
  initialLanguage?: string
  onSubmit: (code: string, language: string) => void
  onTestResults?: (results: TestResult[], isRunning: boolean) => void
  className?: string
}

export function CodingIDE({ 
  questionId, 
  question,
  initialCode, 
  initialLanguage = 'python',
  onSubmit,
  onTestResults,
  className = ''
}: CodingIDEProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(
  LANGUAGES.find(lang => lang.id === initialLanguage) || LANGUAGES[0]
  )
  const [code, setCode] = useState(initialCode || selectedLanguage.defaultCode)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<ExecutionResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [fontSize, setFontSize] = useState(14)
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark')
  const [showMiniMap, setShowMiniMap] = useState(false)
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)
  const [testResults, setTestResults] = useState<Array<{
  test_case_id: number
  input: string
  expected_output: string
  actual_output: string
  passed: boolean
  points: number
  is_hidden: boolean
  }>>([])
  const [showTestResults, setShowTestResults] = useState(false)
  const [showTestPopup, setShowTestPopup] = useState(false)
  const editorRef = useRef<any>(null)
  
  // Test case validation hook
  const { validateCode, isValidating } = useCodingValidation()

  // Update code when language changes
  useEffect(() => {
  if (!initialCode) {
  setCode(selectedLanguage.defaultCode)
  setHasChanges(true)
  }
  }, [selectedLanguage, initialCode])

  // Handle language change
  const handleLanguageChange = (languageId: string) => {
  const newLanguage = LANGUAGES.find(lang => lang.id === languageId)
  if (newLanguage) {
  setSelectedLanguage(newLanguage)
  setOutput(null) // Clear previous output
  setHasChanges(true)
  }
  }

  // Handle editor changes
  const handleEditorChange = (value: string | undefined) => {
  const newCode = value || ''
  setCode(newCode)
  setHasChanges(true)
  }

  // Handle test case validation
  const handleValidateAgainstTests = async () => {
  if (!question?.test_cases || question.test_cases.length === 0) {
  toast.error('No test cases available for this question')
  return
  }

  if (!code.trim()) {
  toast.error('Please write some code before testing')
  return
  }

  // Show popup and start testing
  setShowTestPopup(true)
  setTestResults([])
  
  // Notify parent that testing is starting
  onTestResults?.([], true)

  try {
  const response = await validateCode(questionId, code, selectedLanguage.id)
  const results = response.test_results || []
  setTestResults(results)
  
  // Notify parent with results
  onTestResults?.(results, false)
  
  const passedTests = results.filter((result: any) => result.passed).length
  const totalTests = results.length
  
  if (passedTests === totalTests) {
  toast.success(`All ${totalTests} test cases passed! `)
  } else {
  toast.error(`${passedTests}/${totalTests} test cases passed`)
  }
  } catch (error: any) {
  console.error('Validation error:', error)
  toast.error('Failed to validate code against test cases')
  setTestResults([])
  // Notify parent that testing failed
  onTestResults?.([], false)
  }
  }

  // Handle code execution (test run)
  const handleRunCode = async () => {
  if (!code.trim()) {
  setOutput({
  stdout: '',
  stderr: 'No code to execute',
  runtime: 0,
  memory: 0,
  status: 'error'
  })
  return
  }

  setIsRunning(true)
  setOutput(null)

  try {
  const result = await apiClient.executeCodingCode({
  code: code,
  language: selectedLanguage.id,
  input: input,
  question_id: questionId
  })
  
  setOutput(result)
  
  // Add to execution history
  setExecutionHistory(prev => [...prev, result])
  setCurrentHistoryIndex(executionHistory.length)
  
  if (result.status === 'success') {
  toast.success('Code executed successfully!')
  } else {
  toast.error('Code execution failed')
  }
  } catch (error) {
  setOutput({
  stdout: '',
  stderr: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
  runtime: 0,
  memory: 0,
  status: 'error'
  })
  toast.error('Code execution failed')
  } finally {
  setIsRunning(false)
  }
  }

  // Handle code submission
  const handleSubmit = () => {
  if (!code.trim()) {
  toast.error('Please write some code before submitting')
  return
  }
  
  setHasSubmitted(true)
  setHasChanges(false)
  onSubmit(code, selectedLanguage.id)
  toast.success('Solution submitted successfully!')
  }

  // Handle code formatting
  const handleFormatCode = () => {
  if (editorRef.current) {
  editorRef.current.getAction('editor.action.formatDocument')?.run()
  }
  }

  // Handle code reset
  const handleResetCode = () => {
  setCode(selectedLanguage.defaultCode)
  setOutput(null)
  setHasChanges(true)
  setHasSubmitted(false)
  toast('Code reset to default', { icon: '' })
  }

  // Handle code save
  const handleSaveCode = () => {
  const blob = new Blob([code], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `solution-${questionId}.${selectedLanguage.extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.success('Code saved to file')
  }

  // Handle copy to clipboard
  const handleCopyCode = async () => {
  try {
  await navigator.clipboard.writeText(code)
  toast.success('Code copied to clipboard!')
  } catch (err) {
  toast.error('Failed to copy code')
  }
  }

  // Handle clear console
  const handleClearConsole = () => {
  setOutput(null)
  setExecutionHistory([])
  setCurrentHistoryIndex(-1)
  toast('Console cleared', { icon: '' })
  }

  // Handle font size change
  const handleFontSizeChange = (newSize: number) => {
  setFontSize(newSize)
  toast(`Font size: ${newSize}px`, { icon: '' })
  }

  // Handle theme toggle
  const handleThemeToggle = () => {
  setTheme(prev => prev === 'vs-dark' ? 'vs-light' : 'vs-dark')
  toast(`Switched to ${theme === 'vs-dark' ? 'Light' : 'Dark'} theme`, { icon: '' })
  }

  // Handle history navigation
  const handleHistoryNavigation = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentHistoryIndex > 0) {
  setCurrentHistoryIndex(currentHistoryIndex - 1)
  setOutput(executionHistory[currentHistoryIndex - 1])
  } else if (direction === 'next' && currentHistoryIndex < executionHistory.length - 1) {
  setCurrentHistoryIndex(currentHistoryIndex + 1)
  setOutput(executionHistory[currentHistoryIndex + 1])
  }
  }

  return (
  <div className={`space-y-2 ${isMaximized ? 'fixed inset-0 z-50 bg-gray-900' : ''} ${className}`}>
  {/* Professional IDE Header */}
  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg border border-gray-600">
  <div className="flex items-center gap-4">
  {/* File Icon */}
  <div className="flex items-center gap-2">
  <FileText className="h-4 w-4 text-emerald-400" />
  <span className="text-sm font-mono">solution.{selectedLanguage.extension}</span>
  {hasChanges && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
  </div>
  
  {/* Language Selector */}
  <select
  value={selectedLanguage.id}
  onChange={(e) => handleLanguageChange(e.target.value)}
  className="rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-emerald-500"
  >
  {LANGUAGES.map((lang) => (
  <option key={lang.id} value={lang.id}>
  {lang.label}
  </option>
  ))}
  </select>
  </div>
  
  <div className="flex items-center gap-1">
  {/* IDE Controls */}
  <Button
  variant="ghost"
  size="sm"
  onClick={handleThemeToggle}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title={`Switch to ${theme === 'vs-dark' ? 'Light' : 'Dark'} theme`}
  >
  <Code2 className="w-4 h-4" />
  </Button>
  
  <Button
  variant="ghost"
  size="sm"
  onClick={() => setShowLineNumbers(!showLineNumbers)}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title="Toggle Line Numbers"
  >
  {showLineNumbers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
  </Button>
  
  <Button
  variant="ghost"
  size="sm"
  onClick={() => setShowMiniMap(!showMiniMap)}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title="Toggle Mini Map"
  >
  <Split className="w-4 h-4" />
  </Button>
  
  <div className="w-px h-6 bg-gray-600 mx-2"></div>
  
  {/* Font Size Controls */}
  <div className="flex items-center gap-1">
  <Button
  variant="ghost"
  size="sm"
  onClick={() => handleFontSizeChange(Math.max(10, fontSize - 2))}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title="Decrease Font Size"
  >
  <span className="text-xs">A-</span>
  </Button>
  <span className="text-xs text-gray-300 min-w-[30px] text-center">{fontSize}px</span>
  <Button
  variant="ghost"
  size="sm"
  onClick={() => handleFontSizeChange(Math.min(24, fontSize + 2))}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title="Increase Font Size"
  >
  <span className="text-xs">A+</span>
  </Button>
  </div>
  
  <div className="w-px h-6 bg-gray-600 mx-2"></div>
  
  {/* Action Buttons */}
  <Button
  variant="ghost"
  size="sm"
  onClick={handleFormatCode}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title="Format Code (Shift+Alt+F)"
  >
  <Settings className="w-4 h-4" />
  </Button>
  
  <Button
  variant="ghost"
  size="sm"
  onClick={handleCopyCode}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title="Copy Code"
  >
  <Copy className="w-4 h-4" />
  </Button>
  
  <Button
  variant="ghost"
  size="sm"
  onClick={handleSaveCode}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title="Save Code"
  >
  <Save className="w-4 h-4" />
  </Button>
  
  <Button
  variant="ghost"
  size="sm"
  onClick={handleResetCode}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title="Reset Code"
  >
  <RotateCcw className="w-4 h-4" />
  </Button>
  
  <div className="w-px h-6 bg-gray-600 mx-2"></div>
  
  {/* Execution Controls */}
  <Button
  onClick={handleRunCode}
  disabled={isRunning}
  size="sm"
  className="bg-sage-deep px-3 py-1 text-white hover:bg-sage-deep/90 dark:bg-emerald-600 dark:hover:bg-emerald-500"
  title="Run Code (Ctrl+Enter)"
  >
  {isRunning ? (
  <>
  <Square className="w-4 h-4 mr-1 animate-pulse" />
  <span className="text-sm">Running</span>
  </>
  ) : (
  <>
  <Play className="w-4 h-4 mr-1" />
  <span className="text-sm">Run</span>
  </>
  )}
  </Button>
  
  {/* Test Against Test Cases */}
  {question?.test_cases && question.test_cases.length > 0 && (
  <Button
  onClick={handleValidateAgainstTests}
  disabled={isValidating || isRunning}
  size="sm"
  className="bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-500"
  title="Test Against All Test Cases"
  >
  {isValidating ? (
  <>
  <Square className="w-4 h-4 mr-1 animate-pulse" />
  <span className="text-sm">Testing</span>
  </>
  ) : (
  <>
  <TestTube className="w-4 h-4 mr-1" />
  <span className="text-sm">Test</span>
  </>
  )}
  </Button>
  )}
  
  <Button
  variant="ghost"
  size="sm"
  onClick={() => setIsMaximized(!isMaximized)}
  className="text-gray-300 hover:text-white hover:bg-gray-700 p-1"
  title={isMaximized ? "Exit Fullscreen" : "Enter Fullscreen"}
  >
  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
  </Button>
  </div>
  </div>

  {/* Editor */}
  <div className={`${isMaximized ? 'h-[calc(100vh-200px)]' : 'h-96'} overflow-hidden border-b border-l border-r border-slate-200 dark:border-emerald-900/50`}>
  <MonacoEditor
  height="100%"
  language={MONACO_LANGUAGES[selectedLanguage.id as keyof typeof MONACO_LANGUAGES]}
  value={code}
  onChange={handleEditorChange}
  theme={theme}
  options={{
  fontSize: fontSize,
  minimap: { enabled: showMiniMap },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'on',
  lineNumbers: showLineNumbers ? 'on' : 'off',
  folding: true,
  bracketPairColorization: { enabled: true },
  guides: {
  bracketPairs: true,
  indentation: true
  },
  readOnly: false,
  cursorStyle: 'line',
  cursorWidth: 2,
  renderWhitespace: 'boundary',
  renderControlCharacters: true,
  smoothScrolling: true,
  mouseWheelZoom: true,
  quickSuggestions: {
  other: true,
  comments: true,
  strings: true
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  accessibilitySupport: 'auto'
  }}
  onMount={(editor) => {
  editorRef.current = editor
  }}
  loading={<LoadingSkeleton height={isMaximized ? "h-[calc(100vh-200px)]" : "h-96"} />}
  />
  </div>

  {/* Input Section */}
  {/* <div className="border border-gray-600 bg-gray-900 rounded-b-lg overflow-hidden">
  <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
  <div className="flex items-center gap-2">
  <Terminal className="w-4 h-4 text-green-400" />
  <h4 className="text-sm font-mono text-green-400">
  Input
  </h4>
  <span className="text-xs text-gray-400">(Optional)</span>
  </div>
  <div className="flex items-center gap-2">
  <Button
  variant="ghost"
  size="sm"
  onClick={() => setIsCollapsed(!isCollapsed)}
  className="text-gray-400 hover:text-white hover:bg-gray-700 p-1"
  >
  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
  </Button>
  <Button
  variant="ghost"
  size="sm"
  onClick={() => setInput('')}
  className="text-gray-400 hover:text-white hover:bg-gray-700 p-1"
  title="Clear Input"
  >
  <Trash2 className="w-4 h-4" />
  </Button>
  </div>
  </div>
  {!isCollapsed && (
  <div className="p-3">
  <textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Enter input for your program..."
  className="w-full h-20 p-3 bg-gray-900 border border-gray-700 rounded text-green-400 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
  />
  </div>
  )}
  </div> */}

  {/* Output Section */}
  <div className="border border-gray-600 bg-gray-900 rounded-lg overflow-hidden">
  <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
  <div className="flex items-center gap-2">
  <Terminal className="h-4 w-4 text-emerald-400" />
  <h4 className="font-mono text-sm text-emerald-400">
  Output Console
  </h4>
  {output && (
  <div className="flex items-center gap-2 ml-4">
  <Button
  variant="ghost"
  size="sm"
  onClick={() => handleHistoryNavigation('prev')}
  disabled={currentHistoryIndex <= 0}
  className="text-gray-400 hover:text-white hover:bg-gray-700 p-1"
  title="Previous Execution"
  >
  <ChevronRight className="w-4 h-4 rotate-180" />
  </Button>
  <span className="text-xs text-gray-400">
  {executionHistory.length > 0 ? `${currentHistoryIndex + 1}/${executionHistory.length}` : '0/0'}
  </span>
  <Button
  variant="ghost"
  size="sm"
  onClick={() => handleHistoryNavigation('next')}
  disabled={currentHistoryIndex >= executionHistory.length - 1}
  className="text-gray-400 hover:text-white hover:bg-gray-700 p-1"
  title="Next Execution"
  >
  <ChevronRight className="w-4 h-4" />
  </Button>
  </div>
  )}
  </div>
  <div className="flex items-center gap-2">
  {output && output.runtime > 0 && (
  <div className="flex items-center gap-2 text-xs text-emerald-400/90">
  <Clock className="h-3 w-3 shrink-0" />
  <span>{output.runtime.toFixed(2)}ms</span>
  <Zap className="h-3 w-3 shrink-0" />
  <span>{output.memory}KB</span>
  </div>
  )}
  <Button
  variant="ghost"
  size="sm"
  onClick={handleClearConsole}
  className="text-gray-400 hover:text-white hover:bg-gray-700 p-1"
  title="Clear Console"
  >
  <Trash2 className="w-4 h-4" />
  </Button>
  </div>
  </div>
  <div className="p-3">
  {output ? (
  <div className="min-h-[120px] overflow-auto rounded border border-gray-700 bg-gray-900 p-4 font-mono text-sm whitespace-pre-wrap text-emerald-400">
  <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
  <div className="flex gap-1">
  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
  </div>
  <span>Terminal - {selectedLanguage.label}</span>
  </div>
  
  {output.stdout && (
  <div className="mb-3">
  <div className="mb-1 text-xs text-emerald-400">STDOUT:</div>
  <div className="rounded border-l-2 border-emerald-400 bg-gray-800 p-2 text-emerald-200">
  {output.stdout}
  </div>
  </div>
  )}
  
  {output.stderr && (
  <div className="mb-3">
  <div className="text-red-400 text-xs mb-1">STDERR:</div>
  <div className="text-red-300 bg-gray-800 p-2 rounded border-l-2 border-red-400">
  {output.stderr}
  </div>
  </div>
  )}
  
  {!output.stdout && !output.stderr && (
  <div className="text-gray-400 italic">
  No output generated
  </div>
  )}
  
  {output.status && (
  <div className="mt-3 pt-2 border-t border-gray-700">
  <div className="flex items-center gap-2 text-xs">
  <span className="text-gray-400">Status:</span>
  <span className={`px-2 py-1 rounded text-xs font-medium ${
  output.status === 'success' 
  ? 'bg-emerald-950 text-emerald-300' 
  : 'bg-red-900 text-red-300'
  }`}>
  {output.status}
  </span>
  </div>
  </div>
  )}
  </div>
  ) : (
  <div className="bg-gray-900 text-gray-500 p-4 rounded font-mono text-sm min-h-[120px] border border-gray-700 flex items-center justify-center">
  <div className="text-center">
  <Terminal className="w-8 h-8 mx-auto mb-2 text-gray-600" />
  <div>Click "Run" to execute your code</div>
  <div className="text-xs mt-1">Output will appear here</div>
  </div>
  </div>
  )}
  </div>
  </div>

  {/* Test Results Popup */}
  <TestResultsPopup
  isVisible={showTestPopup}
  onClose={() => setShowTestPopup(false)}
  results={testResults}
  isRunning={isValidating}
  autoHideDelay={5000}
  />

  {/* Submission Status */}
  {(hasSubmitted || hasChanges) && (
  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
  hasSubmitted 
  ? 'border-emerald-200/90 bg-emerald-50/90 dark:border-emerald-700/60 dark:bg-emerald-900/25'
  : 'border-sage/40 bg-sage/15 dark:border-emerald-800/60 dark:bg-emerald-900/25'
  }`}>
  {hasSubmitted ? (
  <>
  <CheckCircle className="h-5 w-5 text-sage-deep dark:text-emerald-400" />
  <span className="text-sm font-medium text-emerald-950 dark:text-emerald-100">
  Solution submitted successfully! You can still edit and resubmit if needed.
  </span>
  </>
  ) : (
  <>
  <AlertCircle className="h-5 w-5 text-sage-deep dark:text-emerald-400" />
  <span className="text-sm font-medium text-sage-deep dark:text-emerald-200">
  You have unsaved changes. Click "Submit Solution" below to save your work.
  </span>
  </>
  )}
  </div>
  )}

  {/* Submit Button */}
  <div className="flex justify-end rounded-lg border border-slate-200/90 bg-sage/10 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
  <Button
  onClick={handleSubmit}
  disabled={!code.trim()}
  className="bg-gradient-to-r from-sage-deep to-emerald-600 px-6 py-3 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:from-sage-deep/95 hover:to-emerald-600/95 hover:shadow-xl dark:from-emerald-700 dark:to-emerald-500 dark:hover:from-emerald-600 dark:hover:to-emerald-400"
  >
  <CheckCircle className="w-5 h-5 mr-2" />
  Submit Solution
  </Button>
  </div>
  </div>
  )
}
