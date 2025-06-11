import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

const skeletonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const shimmerAnimation = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity
    }
  }
};

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <motion.div 
      className="space-y-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2
          }
        },
        exit: {
          opacity: 0,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          variants={skeletonVariants}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <motion.div
                variants={shimmerAnimation}
                animate="animate"
                className="overflow-hidden"
              >
                <Skeleton className="h-4 w-[250px]" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                variants={shimmerAnimation}
                animate="animate"
                className="overflow-hidden"
              >
                <Skeleton className="h-20 w-full" />
              </motion.div>
              <div className="flex justify-end space-x-2">
                {[1, 2, 3].map((btnIndex) => (
                  <motion.div
                    key={btnIndex}
                    variants={shimmerAnimation}
                    animate="animate"
                    className="overflow-hidden"
                  >
                    <Skeleton className="h-10 w-[100px]" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
} 