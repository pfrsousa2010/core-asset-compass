import { Badge } from '@/components/ui/badge';
import { planRules, type PlanType } from '@/hooks/usePlanLimits';

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

export function PlanBadge({ plan, className = '' }: PlanBadgeProps) {
  const planInfo = planRules[plan];
  
  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'green':
        return 'default';
      case 'blue':
        return 'secondary';
      case 'purple':
        return 'outline';
      case 'gold':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge 
      variant={getBadgeVariant(planInfo.color)}
      className={`${getBadgeColor(planInfo.color)} ${className}`}
    >
      <span className="mr-1">{planInfo.icon}</span>
      {planInfo.name}
    </Badge>
  );
} 