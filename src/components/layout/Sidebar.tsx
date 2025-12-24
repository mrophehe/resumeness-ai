import { motion } from 'framer-motion';
import { FileText, Settings, HelpCircle } from 'lucide-react';
import { ATSScore } from '@/components/sidebar/ATSScore';
import { KnowledgeBase } from '@/components/sidebar/KnowledgeBase';
import { VersionHistory } from '@/components/sidebar/VersionHistory';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 h-full bg-card/30 border-r border-border/50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center glow-primary">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient">Resumeness</h1>
            <p className="text-xs text-muted-foreground">AI Resume Engineer</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ATSScore />
        <KnowledgeBase />
        <VersionHistory />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="iconSm">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.aside>
  );
};
