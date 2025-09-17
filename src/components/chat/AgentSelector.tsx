import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentType, AGENT_TYPES, AgentCapabilities } from '@/hooks/useDiamondAgents';

interface AgentSelectorProps {
  currentAgent: AgentType;
  onAgentSelect: (agent: AgentType) => void;
  isLoading?: boolean;
}

export function AgentSelector({ currentAgent, onAgentSelect, isLoading = false }: AgentSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Diamond Expertise Agents</h3>
        <p className="text-sm text-muted-foreground">
          Choose a specialized agent for your diamond consultation
        </p>
      </div>

      <ScrollArea className="h-[400px] w-full">
        <div className="grid gap-3 p-1">
          {Object.entries(AGENT_TYPES).map(([key, agent]) => (
            <AgentCard
              key={key}
              agentType={key as AgentType}
              agent={agent}
              isSelected={currentAgent === key}
              onSelect={() => onAgentSelect(key as AgentType)}
              isLoading={isLoading}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface AgentCardProps {
  agentType: AgentType;
  agent: AgentCapabilities;
  isSelected: boolean;
  onSelect: () => void;
  isLoading: boolean;
}

function AgentCard({ agentType, agent, isSelected, onSelect, isLoading }: AgentCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'ring-2 ring-primary bg-primary/5 border-primary' 
          : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{agent.icon}</span>
          <div className="flex-1">
            <CardTitle className="text-sm leading-tight">
              {agent.name}
            </CardTitle>
            {isSelected && (
              <Badge variant="default" className="text-xs mt-1">
                Active
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-xs leading-tight">
          {agent.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1">
          {agent.expertise.map((skill, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs px-2 py-0.5"
            >
              {skill}
            </Badge>
          ))}
        </div>
        
        <Button 
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full mt-3 h-8"
          disabled={isLoading || isSelected}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? 'Selected' : 'Select Agent'}
        </Button>
      </CardContent>
    </Card>
  );
}