"use client"
import { SortingAlgorithmType, AnimationArrayType } from "@/lib/types";
import { MAX_ANIMATION_SPEED, generateRandomNumberFromInterval } from "@/lib/utils";
import { createContext, useContext, useState, useEffect } from "react";

 
interface SortingAlgorithmContextType {
    arrayToSort: number[];
    setArrayToSort: (array: number[]) => void;
    selectedAlgorithm: SortingAlgorithmType;
    setSelectedAlgorithm: (algorithm: SortingAlgorithmType) => void;
    isSorting: boolean;
    setIsSorting: (isSorting: boolean) => void;
    animationSpeed: number;
    setAnimationSpeed: (speed: number) => void;
    isAnimationComplete: boolean;
    setIsAnimationComplete: (isComplete: boolean) => void;
    resetArrayAndAnimation: () => void;
    // runAnimation: () => void;
    runAnimation: (animations: AnimationArrayType) => void;
    requiresReset: boolean;
  }

const SortingAlgorithmContext = createContext<SortingAlgorithmContextType | undefined>(undefined);

export const SortingAlgorithmProvider = ({ children }: { children: React.ReactNode }) => {
    const [arrayToSort, setArrayToSort] = useState<number[]>([]);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortingAlgorithmType>("bubble")
    const [isSorting, setIsSorting] = useState<boolean>(false);
    const [animationSpeed, setAnimationSpeed] = useState<number>(MAX_ANIMATION_SPEED);
    const [isAnimationComplete, setIsAnimationComplete] = useState<boolean>(false);
    const requiresReset = isAnimationComplete || isSorting;

    useEffect(() => {
        resetArrayAndAnimation();
        window.addEventListener("resize", resetArrayAndAnimation);
    
        return () => {
          window.removeEventListener("resize", resetArrayAndAnimation);
        };
    }, []);
    
    const resetArrayAndAnimation = () => { 
        const contentContainer = document.getElementById("content-container");
        if (!contentContainer) return;
        const contentContainerWidth = contentContainer.clientWidth;

        const tempArray: number[] = [];
        const numLines = contentContainerWidth / 9;
        const containerHeight = window.innerHeight;
        const maxLineHeight = Math.max(containerHeight - 420, 100);
        for (let i = 0; i < numLines; i++) {
            tempArray.push(generateRandomNumberFromInterval(35, maxLineHeight));
        }
        setArrayToSort(tempArray);
        setIsSorting(false);
        setIsAnimationComplete(false);

        const highestId = window.setTimeout(() => {
            for (let i = highestId; i >= 0; i--) {
              window.clearInterval(i);
            }
          }, 0);
      
          setTimeout(() => {
            const arrLines = document.getElementsByClassName("array-line");
            for (let i = 0; i < arrLines.length; i++) {
              arrLines[i].classList.remove("change-line-color");
              arrLines[i].classList.add("default-line-color");
            }
          }, 0);
    };


    const runAnimation = (animations: AnimationArrayType) => {
        setIsSorting(true);

        const inverseSpeed = (1 / animationSpeed) * 200;
        const arrLines = document.getElementsByClassName("array-line") as HTMLCollectionOf<HTMLElement>;
   
        const updateClassList = (
            indexes: number[],
            addClassName: string,
            removeClassName: string
          ) => {
            indexes.forEach((index) => {
              arrLines[index].classList.add(addClassName);
              arrLines[index].classList.remove(removeClassName);
            });
        };
        

        const updateHeightValue = (
            lineIndex: number,
            newHeight: number | undefined
          ) => {
            arrLines[lineIndex].style.height = `${newHeight}px`;
        };
        
        animations.forEach((animation, index) => {
            setTimeout(() => {
              const [lineIndexes, isSwap] = animation;
              if (!isSwap) {
                updateClassList(
                  lineIndexes,
                  "change-line-color",
                  "default-line-color"
                );
                setTimeout(
                  () =>
                    updateClassList(
                      lineIndexes,
                      "default-line-color",
                      "change-line-color"
                    ),
                  inverseSpeed
                );
              } else {
                const [lineIndex, newHeight] = lineIndexes;
                updateHeightValue(lineIndex, newHeight);
              }
            }, index * inverseSpeed);
        });
        
        const finalTimeout = animations.length * inverseSpeed;
        setTimeout(() => {
          Array.from(arrLines).forEach((line) => {
            line.classList.add("pulse-animation", "change-line-color");
            line.classList.remove("default-line-color");
          });
    
          setTimeout(() => {
            Array.from(arrLines).forEach((line) => {
              line.classList.remove("pulse-animation", "change-line-color");
              line.classList.add("default-line-color");
            });
            setIsSorting(false);
            setIsAnimationComplete(true);
          }, 1000);
        }, finalTimeout);
    };

    const value = {
        arrayToSort,
        setArrayToSort,
        selectedAlgorithm,
        setSelectedAlgorithm,
        isSorting,
        setIsSorting,
        animationSpeed,
        setAnimationSpeed,
        isAnimationComplete,
        setIsAnimationComplete,
        resetArrayAndAnimation,
        runAnimation,
        requiresReset,
    }

    return (
        <SortingAlgorithmContext.Provider value={value}>
            {children}
        </SortingAlgorithmContext.Provider>
    )
}

export const useSortingAlgorithmContext = () => {
    const context = useContext(SortingAlgorithmContext)
    if (!context) {
        throw new Error("useSortingAlgorithmContext must be used within a SortingAlgorithmProvider")
    }
    return context;
}