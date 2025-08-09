'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function TestDialogPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dialog Test Page</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Open Test Dialog</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>
                This is a test dialog to check if the Dialog component works correctly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Test Field</Label>
                <p className="text-sm text-gray-600">This is a test field</p>
              </div>
              <div>
                <Label>Another Field</Label>
                <p className="text-sm text-gray-600">This is another test field</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Click the button above to test the Dialog component.
          </p>
        </div>
      </div>
    </div>
  );
} 