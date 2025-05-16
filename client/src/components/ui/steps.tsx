import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface StepsProps {
  currentStep: number;
  className?: string;
  children: ReactNode;
}

export const Steps: React.FC<StepsProps> = ({ 
  currentStep, 
  className, 
  children 
}) => {
  // Count the number of steps from children
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={cn('flex items-center w-full', className)}>
      {childrenArray.map((child, index) => {
        // Only accept Step components
        if (!React.isValidElement(child) || child.type !== Step) {
          return null;
        }
        
        // Clone the step element with additional props
        return React.cloneElement(child, {
          ...child.props,
          stepNumber: index + 1,
          isActive: index + 1 === currentStep,
          isCompleted: index + 1 < currentStep,
          isLastStep: index === childrenArray.length - 1,
          key: index
        });
      })}
    </div>
  );
};

interface StepProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: 'incomplete' | 'current' | 'complete';
  onClick?: () => void;
  stepNumber?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isLastStep?: boolean;
}

export const Step: React.FC<StepProps> = ({
  title,
  description,
  icon,
  status,
  onClick,
  stepNumber,
  isActive,
  isCompleted,
  isLastStep
}) => {
  // Determine the status based on props
  const stepStatus = status || (isCompleted ? 'complete' : isActive ? 'current' : 'incomplete');
  
  return (
    <div className={cn('flex items-center', !isLastStep && 'flex-1')}>
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
            {
              'border-primary bg-primary text-primary-foreground': stepStatus === 'complete' || stepStatus === 'current',
              'border-muted bg-background': stepStatus === 'incomplete',
              'cursor-pointer hover:bg-muted/50': !!onClick,
              'cursor-default': !onClick
            }
          )}
          disabled={!onClick}
        >
          {stepStatus === 'complete' ? (
            <CheckIcon className="h-5 w-5" />
          ) : icon ? (
            icon
          ) : (
            <span>{stepNumber}</span>
          )}
        </button>
        
        <div className="mt-2 text-center">
          <div className={cn(
            'text-sm font-medium',
            {
              'text-foreground': stepStatus === 'complete' || stepStatus === 'current',
              'text-muted-foreground': stepStatus === 'incomplete'
            }
          )}>
            {title}
          </div>
          {description && (
            <div className={cn(
              'text-xs',
              {
                'text-muted-foreground': stepStatus === 'complete' || stepStatus === 'current',
                'text-muted-foreground/70': stepStatus === 'incomplete'
              }
            )}>
              {description}
            </div>
          )}
        </div>
      </div>
      
      {!isLastStep && (
        <div 
          className={cn(
            'h-[2px] flex-1 mx-2',
            {
              'bg-primary': stepStatus === 'complete',
              'bg-muted': stepStatus === 'current' || stepStatus === 'incomplete'
            }
          )} 
        />
      )}
    </div>
  );
};