import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Edit, CheckCircle2, XCircle } from "lucide-react"
import type { FlashcardSuggestion } from "../../types"
import { motion, AnimatePresence } from "framer-motion"

interface FlashcardSuggestionListProps {
  suggestions: FlashcardSuggestion[];
  onAction: (suggestionId: number, action: 'accept' | 'reject' | 'edit', updatedData?: { front: string; back: string }) => void;
  reviewedCards: Record<number, 'accept' | 'reject' | 'edit'>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -100 }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const statusIconVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: "spring" } }
};

export function FlashcardSuggestionList({ suggestions, onAction, reviewedCards }: FlashcardSuggestionListProps) {
  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion) => {
          const reviewStatus = reviewedCards[suggestion.id];
          
          return (
            <motion.div
              key={suggestion.id}
              variants={cardVariants}
              layout
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Card className={
                reviewStatus === 'accept' ? 'border-green-500' :
                reviewStatus === 'reject' ? 'border-red-500' :
                reviewStatus === 'edit' ? 'border-blue-500' : ''
              }>
                <CardHeader className="relative">
                  <CardTitle>Front</CardTitle>
                  <CardDescription className="whitespace-pre-wrap">{suggestion.front}</CardDescription>
                  {reviewStatus && (
                    <motion.div 
                      className="absolute top-4 right-6"
                      variants={statusIconVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {reviewStatus === 'accept' && <CheckCircle2 className="text-green-500 h-6 w-6" />}
                      {reviewStatus === 'reject' && <XCircle className="text-red-500 h-6 w-6" />}
                      {reviewStatus === 'edit' && <Edit className="text-blue-500 h-6 w-6" />}
                    </motion.div>
                  )}
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2">Back</CardTitle>
                  <CardDescription className="whitespace-pre-wrap">{suggestion.back}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {!reviewStatus && (
                    <>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAction(suggestion.id, 'reject')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </motion.div>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAction(suggestion.id, 'edit')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </motion.div>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAction(suggestion.id, 'accept')}
                          className="text-green-500 hover:text-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                      </motion.div>
                    </>
                  )}
                  {/* {reviewStatus && (
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAction(suggestion.id, reviewStatus)}
                      >
                        Change Review
                      </Button>
                    </motion.div>
                  )} */}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
} 