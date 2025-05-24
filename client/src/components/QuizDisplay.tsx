import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { QuizBlockContent, QuizQuestion, UserQuizSubmission } from '../services/api';
import { Button } from "./ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.js";
import { Label } from "./ui/label.js";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group.js";
import { Checkbox } from "./ui/checkbox.js";
import { Input } from "./ui/input.js";
import { Textarea } from "./ui/textarea.js";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert.js";
import { Loader2, CheckCircle2, XCircle, Timer, RotateCcw, PlayCircle, ListChecks } from 'lucide-react';
import { cn } from "../lib/utils";
import * as apiService from '../services/api';

const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const themedInputBorder = `border-gray-300 dark:border-gray-600`;
const mutedText = 'text-gray-600 dark:text-gray-400';
const questionCardBg = 'bg-white dark:bg-gray-800';
const primaryButtonClasses = `bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `border-[#C5A467] text-[#C5A467] hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const inputClasses = `h-9 rounded-md px-3 text-sm bg-white dark:bg-gray-700 ${themedInputBorder} ${deepBrown} focus:ring-2 focus:ring-offset-1 focus:ring-[#C5A467]/80 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400`;
const textAreaClasses = `rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 ${themedInputBorder} ${deepBrown} focus:ring-2 focus:ring-offset-1 focus:ring-[#C5A467]/80 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400`;

type QuizState = 'initializing_context' | 'loading_submission' | 'intro' | 'taking' | 'submitting' | 'results';

interface UserAnswers { [questionId: string]: string | string[]; }
interface QuizResults { score: number; passed: boolean; correctness: { [questionId: string]: boolean; }; }

interface QuizDisplayProps {
    quizData: QuizBlockContent & { id?: string };
    databaseQuizId: string;
    onQuizSubmitSuccess?: () => void;
    initialUserSubmission?: UserQuizSubmission | null;
    isLoadingInitialSubmission?: boolean;
    weekId?: string;
    courseId?: string;
    passingScore?: number;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({
    quizData,
    databaseQuizId,
    onQuizSubmitSuccess,
    initialUserSubmission,
    isLoadingInitialSubmission,
    weekId,
    courseId,
    passingScore
}) => {
    console.log(`QuizDisplay (${databaseQuizId}): RENDER START. Props received:`, {
        quizData: { title: quizData.title, id: quizData.id, questionsCount: quizData.questions?.length },
        initialUserSubmission: initialUserSubmission ? 'Exists' : initialUserSubmission,
        isLoadingInitialSubmission,
        weekId,
        courseId
    });

    const [isContextReady, setIsContextReady] = useState(!!(weekId && courseId));
    const [quizState, setQuizState] = useState<QuizState>(() => {
        if (!weekId || !courseId) return 'initializing_context';
        if (isLoadingInitialSubmission) return 'loading_submission';
        if (initialUserSubmission) return 'results';
        return quizData.settings?.timeLimit && quizData.settings.timeLimit > 0 ? 'intro' : 'taking';
    });

    const [answers, setAnswers] = useState<UserAnswers>(() => initialUserSubmission?.answers || {});
    const [results, setResults] = useState<QuizResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const isTimed = useMemo(() => typeof quizData.settings?.timeLimit === 'number' && quizData.settings.timeLimit > 0, [quizData.settings?.timeLimit]);
    const prevQuizDataIdRef = useRef<string | undefined>(undefined); // MODIFIED: Added initial value

    const simulateGrading = useCallback((userAnswersToGrade: UserAnswers): QuizResults => {
        let correctCount = 0;
        const correctness: { [key: string]: boolean } = {};
        const questionsForGrading = quizData.questions || [];
        questionsForGrading.forEach(q => {
            const userAnswer = userAnswersToGrade[q.id];
            let isCorrect = false;
            if (q.type === 'multiple_choice' || q.type === 'checkbox') {
                const correctOptions = q.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
                if (q.type === 'multiple_choice') {
                    isCorrect = userAnswer === correctOptions[0];
                } else {
                    const userAnswerArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
                    const sortedCorrectOptions = [...correctOptions].sort();
                    isCorrect = sortedCorrectOptions.length > 0 &&
                                sortedCorrectOptions.length === userAnswerArray.length &&
                                sortedCorrectOptions.every((id, index) => id === userAnswerArray[index]);
                }
            } else if (q.type === 'short_answer' || q.type === 'paragraph') {
                isCorrect = false;
            }
            correctness[q.id] = isCorrect;
            if (isCorrect) correctCount++;
        });
        const totalQuestions = questionsForGrading.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
        const passingScore = quizData.settings?.passingScore ?? 0;
        const passed = score >= passingScore;
        return { score, passed, correctness };
    }, [quizData.questions, quizData.settings?.passingScore]);

    useEffect(() => {
        console.log(`QuizDisplay (${databaseQuizId}): useEffect (MAIN STATE LOGIC) - Props:`,
            { quizDataTitle: quizData.title, quizDataId: quizData.id, prevQuizDataId: prevQuizDataIdRef.current, initialUserSubmissionExists: !!initialUserSubmission, isLoadingInitialSubmission, propWeekId: weekId, propCourseId: courseId, currentQuizState: quizState });

        setError(null);

        if (!weekId || !courseId) {
            console.log(`QuizDisplay (${databaseQuizId}): useEffect - Context NOT ready. Setting state to 'initializing_context'.`);
            if (quizState !== 'initializing_context') setQuizState('initializing_context');
            if (isContextReady) setIsContextReady(false);
            prevQuizDataIdRef.current = quizData.id;
            return;
        }

        if (!isContextReady) {
            console.log(`QuizDisplay (${databaseQuizId}): useEffect - Context IS NOW READY.`);
            setIsContextReady(true);
        }

        const currentQuestionsFromProp = quizData.questions || [];
        const quizDataActuallyChanged = quizData.id !== prevQuizDataIdRef.current;

        if (quizDataActuallyChanged) {
            console.log(`QuizDisplay (${databaseQuizId}): quizData prop itself changed (ID: ${prevQuizDataIdRef.current} -> ${quizData.id}). Forcing re-evaluation.`);
        }

        if (isLoadingInitialSubmission) {
            console.log(`QuizDisplay (${databaseQuizId}): useEffect - isLoadingInitialSubmission is TRUE.`);
            if (quizState !== 'loading_submission') {
                console.log(`QuizDisplay (${databaseQuizId}): Setting quizState to 'loading_submission'.`);
                setQuizState('loading_submission');
            }
            setShuffledQuestions(quizData.settings?.shuffleQuestions ? [...currentQuestionsFromProp].sort(() => Math.random() - 0.5) : currentQuestionsFromProp);
            console.log(`QuizDisplay (${databaseQuizId}): useEffect - Questions (re)set WHILE loading submission. Count: ${currentQuestionsFromProp.length}`);
            prevQuizDataIdRef.current = quizData.id;
            return;
        }

        if (quizDataActuallyChanged ||
            quizState === 'initializing_context' ||
            quizState === 'loading_submission' ||
            (quizState !== 'results' && quizState !== 'submitting')
        ) {
            console.log(`QuizDisplay (${databaseQuizId}): useEffect - Condition to (re)set/shuffle questions met. quizDataChanged: ${quizDataActuallyChanged}, quizState: ${quizState}`);
            setShuffledQuestions(quizData.settings?.shuffleQuestions ? [...currentQuestionsFromProp].sort(() => Math.random() - 0.5) : currentQuestionsFromProp);
            console.log(`QuizDisplay (${databaseQuizId}): useEffect - Questions (re)shuffled/set. Count: ${currentQuestionsFromProp.length}`);
        }


        if (initialUserSubmission) {
            if (quizDataActuallyChanged && quizState !== 'results') {
                console.log(`QuizDisplay (${databaseQuizId}): useEffect - quizData changed AND initialUserSubmission exists for new quiz. Setting state to 'results'.`);
                setAnswers(initialUserSubmission.answers || {});
                const finalScore = initialUserSubmission.score ?? simulateGrading(initialUserSubmission.answers || {}).score;
                setResults({ score: finalScore, passed: finalScore >= (quizData.settings?.passingScore ?? 0), correctness: simulateGrading(initialUserSubmission.answers || {}).correctness });
                setQuizState('results');
            } else if (!quizDataActuallyChanged && (quizState === 'intro' || quizState === 'taking')) {
                console.log(`QuizDisplay (${databaseQuizId}): useEffect - initialUserSubmission exists, quizData UNCHANGED, but quizState is '${quizState}'. Expected for retake/fresh start. State preserved.`);
            } else if (quizState !== 'results') {
                console.log(`QuizDisplay (${databaseQuizId}): useEffect - Found initialUserSubmission (quizData UNCHANGED). Current state '${quizState}'. Setting state to 'results'.`);
                setAnswers(initialUserSubmission.answers || {});
                const finalScore = initialUserSubmission.score ?? simulateGrading(initialUserSubmission.answers || {}).score;
                setResults({ score: finalScore, passed: finalScore >= (quizData.settings?.passingScore ?? 0), correctness: simulateGrading(initialUserSubmission.answers || {}).correctness });
                setQuizState('results');
            }
        } else {
            if (quizDataActuallyChanged || quizState === 'loading_submission' || quizState === 'initializing_context') {
                console.log(`QuizDisplay (${databaseQuizId}): useEffect - NO initialUserSubmission. quizDataChanged: ${quizDataActuallyChanged}, wasState: ${quizState}. Resetting for new attempt.`);
                setAnswers({});
                setResults(null);
                setTimeLeft(null);
                if (isTimed) {
                    setQuizState('intro');
                } else {
                    setQuizState('taking');
                }
            } else if (isContextReady && (quizState === 'intro' || quizState === 'taking')) {
                console.log(`QuizDisplay (${databaseQuizId}): useEffect - NO initialUserSubmission, quizState is already '${quizState}'. No change needed.`);
            }
        }
        prevQuizDataIdRef.current = quizData.id;
    }, [
        quizData,
        initialUserSubmission,
        isLoadingInitialSubmission,
        simulateGrading,
        isTimed,
        databaseQuizId,
        weekId,
        courseId,
        isContextReady,
        quizState
    ]);

    const handleSubmit = useCallback(async (event?: React.FormEvent, timedOut: boolean = false) => {
        if (event) event.preventDefault();

        if (!isContextReady || !weekId || !courseId) {
            setError("An critical error occurred: Quiz context is not fully initialized.");
            return;
        }
        if (quizState !== 'taking' || !databaseQuizId) return;

        setError(null);
        let allRequiredAnswered = true;
        if (!timedOut) {
            for (const q of shuffledQuestions) {
                if (q.required) {
                    const answer = answers[q.id];
                    const isAnswerEmpty = answer === undefined || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'string' && answer.trim() === '');
                    if (isAnswerEmpty) {
                        allRequiredAnswered = false;
                        break;
                    }
                }
            }
            if (!allRequiredAnswered) {
                setError("Please answer all required questions (marked with *).");
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }

        setQuizState('submitting');
        try {
            const submissionPayload = { answers, weekId, courseId };
            await apiService.submitQuizAttempt(databaseQuizId, submissionPayload);
            const calculatedResults = simulateGrading(answers);
            setResults(calculatedResults);
            setQuizState('results');
            if (onQuizSubmitSuccess) onQuizSubmitSuccess();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (apiError: any) {
            setError(apiError?.response?.data?.message || apiError.message || "Failed to submit quiz.");
            setQuizState('taking');
        }
    }, [
        quizState, answers, shuffledQuestions, simulateGrading, databaseQuizId,
        onQuizSubmitSuccess, weekId, courseId, isContextReady
    ]);

    useEffect(() => {
        if (quizState !== 'taking' || timeLeft === null || timeLeft <= 0 || !isContextReady) return;
        const timerId = setInterval(() => {
            setTimeLeft(prevTimeLeft => {
                if (prevTimeLeft === null || prevTimeLeft <= 1) {
                    clearInterval(timerId);
                    if (quizState === 'taking') handleSubmit(undefined, true);
                    return 0;
                }
                return prevTimeLeft - 1;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [quizState, timeLeft, handleSubmit, databaseQuizId, isContextReady]);

    const startQuiz = useCallback(() => {
        if (!isContextReady) {
            setError("Quiz is not ready yet. Please wait a moment.");
            return;
        }
        const timeLimit = quizData.settings?.timeLimit;
        if (!isTimed || typeof timeLimit !== 'number') {
            setQuizState('taking');
            return;
        }
        setError(null);
        setTimeLeft(timeLimit * 60);
        setQuizState('taking');
    }, [isTimed, quizData.settings?.timeLimit, databaseQuizId, setQuizState, setError, setTimeLeft, isContextReady, quizData.id]);

    const resetQuizStateForRetake = useCallback(() => {
        if (!isContextReady) return;
        setAnswers({});
        setResults(null);
        setError(null);
        setTimeLeft(null);
        const questions = quizData.questions || [];
        const shouldShuffle = quizData.settings?.shuffleQuestions;
        const questionsToDisplay = shouldShuffle ? [...questions].sort(() => Math.random() - 0.5) : questions;
        setShuffledQuestions(questionsToDisplay);

        const currentIsTimed = typeof quizData.settings?.timeLimit === 'number' && quizData.settings.timeLimit > 0;
        if (currentIsTimed) setQuizState('intro');
        else setQuizState('taking');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [
        quizData.questions, quizData.settings?.shuffleQuestions, quizData.settings?.timeLimit,
        databaseQuizId, setAnswers, setResults, setError, setTimeLeft,
        setShuffledQuestions, setQuizState, isContextReady, quizData.id
    ]);

    const handleAnswerChange = useCallback((questionId: string, questionType: QuizQuestion['type'], value: string, isChecked?: boolean) => {
        if (quizState !== 'taking' || !isContextReady) return;
        setAnswers(prev => {
            const currentAnswer = prev[questionId];
            let newAnswer: string | string[];
            if (questionType === 'checkbox') {
                const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
                newAnswer = isChecked ? [...currentArray, value] : currentArray.filter(item => item !== value);
            } else {
                newAnswer = value;
            }
            return { ...prev, [questionId]: newAnswer };
        });
    }, [quizState, isContextReady]);

    const formatTime = (totalSeconds: number | null): string | null => {
        if (totalSeconds === null || totalSeconds === undefined) return null;
        if (totalSeconds < 0) totalSeconds = 0;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    const formattedTimeLeft = formatTime(timeLeft);

    const renderedQuestions = useMemo(() => {
        if (!isContextReady || quizState === 'intro' || quizState === 'loading_submission' || quizState === 'initializing_context') {
            return null;
        }
        const currentQuestionsToRender = shuffledQuestions || [];
        if (currentQuestionsToRender.length === 0 && (quizState === 'taking' || quizState === 'results')) {
            console.warn(`QuizDisplay (${databaseQuizId}): renderedQuestions - shuffledQuestions is empty in state ${quizState}. quizData.questions from prop has ${quizData.questions?.length || 0} items. quizData.id from prop: ${quizData.id}`);
        }

        return currentQuestionsToRender.map((q, index) => {
            const isQuestionCorrectByUser = results?.correctness[q.id];
            const showQuestionFeedback = quizState === 'results' && quizData.settings?.showCorrectAnswers;
            const userAnswer = answers[q.id];
            const isDisabled = quizState !== 'taking';
            return (
                <div
                    key={q.id || `q-${index}`}
                    className={cn(
                        `p-4 border rounded-md ${questionCardBg} ${themedInputBorder} relative transition-all duration-300 mb-4`,
                        showQuestionFeedback && isQuestionCorrectByUser === false && 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                    )}
                >
                    {showQuestionFeedback && isQuestionCorrectByUser === false && (
                        <div className="absolute top-2 right-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                    )}
                    <Label className={cn(`block font-medium text-base mb-1 ${deepBrown}`)}> {index + 1}. {q.question} {q.required && <span className="text-red-500">*</span>} </Label>
                    {q.description && <p className={`text-xs mb-3 ${mutedText}`}>{q.description}</p>}

                    {q.type === 'multiple_choice' && q.options && ( <RadioGroup value={userAnswer as string || ''} onValueChange={(value) => handleAnswerChange(q.id, q.type, value)} className="space-y-1.5" disabled={isDisabled} > {q.options.map((opt) => { const isSelected = userAnswer === opt.id; return ( <div key={opt.id} className="flex items-center space-x-2"> <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} disabled={isDisabled} aria-label={`Option ${opt.text}`} className={cn( "border-gray-400 dark:border-gray-500 text-[#C5A467] focus:ring-[#C5A467]", "data-[state=checked]:border-[#C5A467] data-[state=checked]:text-[#C5A467]", showQuestionFeedback && isSelected && !opt.isCorrect && "border-red-500 text-red-600 data-[state=checked]:border-red-700 data-[state=checked]:text-red-700" )} /> <Label htmlFor={`${q.id}-${opt.id}`} className={cn( `font-normal ${midBrown}`, isDisabled ? 'opacity-70 cursor-default' : 'cursor-pointer', showQuestionFeedback && isSelected && !opt.isCorrect && "text-red-700 dark:text-red-400 line-through" )}> {opt.text} </Label> </div> ); })} </RadioGroup> )}
                    {q.type === 'checkbox' && q.options && ( <div className="space-y-1.5"> {q.options.map((opt) => { const isSelected = Array.isArray(userAnswer) && userAnswer.includes(opt.id); return ( <div key={opt.id} className="flex items-center space-x-2"> <Checkbox id={`${q.id}-${opt.id}`} checked={isSelected} disabled={isDisabled} aria-label={`Option ${opt.text}`} onCheckedChange={(checked) => handleAnswerChange(q.id, q.type, opt.id, !!checked)} className={cn( "border-gray-400 dark:border-gray-500 data-[state=checked]:bg-[#C5A467] data-[state=checked]:text-white dark:data-[state=checked]:bg-[#a07f44] data-[state=checked]:border-[#C5A467]", showQuestionFeedback && isSelected && !opt.isCorrect && "border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-700" )} /> <Label htmlFor={`${q.id}-${opt.id}`} className={cn( `font-normal ${midBrown}`, isDisabled ? 'opacity-70 cursor-default' : 'cursor-pointer', showQuestionFeedback && isSelected && !opt.isCorrect && "text-red-700 dark:text-red-400 line-through" )}> {opt.text} </Label> </div> ); })} </div> )}
                    {q.type === 'short_answer' && ( <Input id={q.id} type="text" value={userAnswer as string || ''} required={q.required} disabled={isDisabled} readOnly={isDisabled} placeholder={isDisabled ? "" : "Your answer"} onChange={(e) => handleAnswerChange(q.id, q.type, e.target.value)} className={cn(inputClasses, showQuestionFeedback && isQuestionCorrectByUser === false && "!border-red-400 dark:!border-red-600")} /> )}
                    {q.type === 'paragraph' && ( <Textarea id={q.id} value={userAnswer as string || ''} required={q.required} rows={4} disabled={isDisabled} readOnly={isDisabled} placeholder={isDisabled ? "" : "Your answer"} onChange={(e) => handleAnswerChange(q.id, q.type, e.target.value)} className={cn(textAreaClasses, showQuestionFeedback && isQuestionCorrectByUser === false && "!border-red-400 dark:!border-red-600")} /> )}
                </div>
            );
        });
    }, [shuffledQuestions, answers, quizState, results, handleAnswerChange, quizData.settings?.showCorrectAnswers, databaseQuizId, isContextReady, quizData.questions, quizData.id]);

    console.log(`QuizDisplay (${databaseQuizId}): FINAL RENDER. quizState: ${quizState}, isContextReady: ${isContextReady}, shuffledQuestions count: ${shuffledQuestions.length}`);

    if (quizState === 'loading_submission' || quizState === 'initializing_context') {
        return (
            <Card className={cn(`not-prose my-4 border ${themedInputBorder}`)}>
                <CardHeader><CardTitle className={deepBrown}>
                    {quizState === 'loading_submission' ? 'Loading Your Submission...' : 'Initializing Quiz...'}
                </CardTitle></CardHeader>
                <CardContent className="flex justify-center items-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C5A467]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(`not-prose my-4 border ${themedInputBorder}`)}>
            <CardHeader className="pb-3 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle className={`text-xl font-semibold ${deepBrown}`}>{quizData.title || 'Quiz'}</CardTitle>
                    {quizData.description && <CardDescription className={`text-sm mt-1 ${midBrown}`}>{quizData.description}</CardDescription>}
                </div>
                {quizState === 'taking' && isContextReady && isTimed && formattedTimeLeft !== null && (
                    <div className={cn(`flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium shrink-0`, timeLeft !== null && timeLeft <= 60 ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' : midBrown)}>
                        <Timer className="h-4 w-4" />
                        <span>Time Left: {formattedTimeLeft}</span>
                    </div>
                )}
                {quizState === 'intro' && isTimed && typeof quizData.settings?.timeLimit === 'number' && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium shrink-0 ${midBrown}`}>
                        <Timer className="h-4 w-4" />
                        <span>Total Time: {quizData.settings.timeLimit} minutes</span>
                    </div>
                )}
                {quizState === 'results' && results && (
                    <div className={cn(`flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium shrink-0`, results.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')}>
                        {results.passed ? <CheckCircle2 className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                        <span>Score: {results.score}%</span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-5">
                {/* MODIFIED: Removed redundant quizState checks */}
                {error && ( <Alert variant="destructive" className="mb-4"> <XCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}

                {quizState === 'results' && results && (
                    <Alert variant={results.passed ? "default" : "destructive"} className={cn("mb-6", results.passed ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700" : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700")}>
                        {results.passed ? <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-300" /> : <XCircle className="h-4 w-4 text-red-700 dark:text-red-300" />}
                        <AlertTitle className={cn(results.passed ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200")}>
                            {initialUserSubmission && !error && results.score === (initialUserSubmission.score ?? 0) ? "Your Previous Result" : (results.passed ? 'Quiz Passed!' : 'Quiz Failed')}
                        </AlertTitle>
                        <AlertDescription className={cn(results.passed ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300")}>
                            Your score: {results.score}% {quizData.settings?.passingScore != null ? `(Passing score: ${quizData.settings.passingScore}%)` : ''}
                        </AlertDescription>
                    </Alert>
                )}

                {quizState === 'intro' && isContextReady && (
                    <div className="text-center space-y-4 py-8">
                        <h3 className={`text-lg font-medium ${midBrown}`}>Ready to start the quiz?</h3>
                        {isTimed && typeof quizData.settings?.timeLimit === 'number' && ( <p className={mutedText}> This quiz is timed. You will have <span className="font-semibold">{quizData.settings.timeLimit} minutes</span> to complete it. <br/> The timer will start as soon as you click 'Start Quiz' and cannot be paused. </p> )}
                        {!isTimed && ( <p className={mutedText}>Click 'Start Quiz' to begin.</p> )}
                        <Button onClick={startQuiz} disabled={!isContextReady} className={`${primaryButtonClasses} h-10 px-6 text-base`}>
                            <PlayCircle className="mr-2 h-5 w-5" /> Start Quiz
                        </Button>
                    </div>
                )}

                {(quizState === 'taking' || quizState === 'submitting' || quizState === 'results') && isContextReady && (
                    <>
                        {(!shuffledQuestions || shuffledQuestions.length === 0) ? (
                            <p className={mutedText}>This quiz has no questions yet.</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-0">
                                {renderedQuestions}

                                <div className="flex flex-col sm:flex-row justify-end pt-3 gap-3 mt-4 border-t dark:border-gray-700">
                                    {quizState === 'results' && quizData.settings?.allowRetake && (
                                        <Button type="button" variant="outline" onClick={resetQuizStateForRetake} className={`${outlineButtonClasses} h-9 w-full sm:w-auto order-2 sm:order-1`} disabled={!isContextReady}> <RotateCcw className="mr-2 h-4 w-4"/> Retake Quiz </Button>
                                    )}
                                    {quizState === 'results' && !quizData.settings?.allowRetake && (
                                        <p className={`text-sm ${mutedText} text-right w-full order-1 sm:order-2 self-center`}>
                                            {initialUserSubmission && results?.score === (initialUserSubmission.score ?? 0) ? "This was your latest attempt." : "Retakes are not allowed for this quiz."}
                                        </p>
                                    )}
                                    {(quizState === 'taking' || quizState === 'submitting') && (
                                        <Button type="submit" disabled={quizState !== 'taking' || !isContextReady} className={`${primaryButtonClasses} h-9 w-full sm:w-auto order-1 sm:order-2`}>
                                            {quizState === 'submitting' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting...</> : 'Submit Quiz'}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        )}
                    </>
                )}
                {/* MODIFIED: Removed redundant quizState checks */}
                {(!isContextReady) && (
                    <div className="p-4 text-orange-600 text-center">Waiting for quiz context to be ready...</div>
                )}
            </CardContent>
        </Card>
    );
};

export default QuizDisplay;