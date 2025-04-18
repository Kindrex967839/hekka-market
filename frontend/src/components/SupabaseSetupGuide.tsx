import { useState } from "react";
import { Code } from "@/components/ui/code-block";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import * as scripts from "../utils/supabaseSchema";

interface Props {
  onComplete: () => void;
}

export function SupabaseSetupGuide({ onComplete }: Props) {
  const [activeTab, setActiveTab] = useState("create");
  const [steps, setSteps] = useState({
    createAccount: false,
    createProject: false,
    runScripts: false,
    setupStorage: false,
    configureClient: false,
  });

  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");

  const updateStep = (step: keyof typeof steps, value: boolean) => {
    setSteps(prev => ({ ...prev, [step]: value }));
  };

  const allStepsCompleted = Object.values(steps).every(step => step);

  const saveClientConfig = () => {
    // In a real app, we'd save this to local storage or another persistent store
    // For now, we'll just show as complete if values are entered
    if (supabaseUrl && supabaseKey) {
      updateStep('configureClient', true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Supabase Setup Guide</h2>
        <p className="text-gray-600 mb-6">
          Follow these steps to set up your Supabase project for HEKKA MARKET. You'll create a new Supabase project, run SQL scripts to create the database schema, and configure the app to connect to your project.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">1. Create Project</TabsTrigger>
            <TabsTrigger value="configure">2. Setup Database</TabsTrigger>
            <TabsTrigger value="connect">3. Connect</TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Create Project */}
          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="createAccount" 
                  checked={steps.createAccount}
                  onCheckedChange={(checked) => updateStep('createAccount', checked === true)}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="createAccount" className="font-semibold">Create a Supabase Account</Label>
                  <p className="text-sm text-gray-500">
                    If you don't have one already, sign up at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">https://supabase.com</a>
                  </p>
                </div>
              </div>

              <Separator />
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="createProject" 
                  checked={steps.createProject}
                  onCheckedChange={(checked) => updateStep('createProject', checked === true)}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="createProject" className="font-semibold">Create a New Supabase Project</Label>
                  <p className="text-sm text-gray-500">
                    In the Supabase dashboard, click "New Project" and follow the prompts. Choose a name for your project, set a secure database password, and select a region close to your users.
                  </p>
                  <div className="mt-2">
                    <img 
                      src="https://supabase.com/images/blog/lw5-one-more-thing/one-more-thing-thumb.jpg" 
                      alt="Supabase Dashboard" 
                      className="rounded-md border border-gray-200 shadow-sm w-full max-w-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <div></div>
                <Button onClick={() => setActiveTab("configure")} disabled={!steps.createAccount || !steps.createProject}>
                  Next: Setup Database
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab 2: Configure Database */}
          <TabsContent value="configure" className="space-y-4 mt-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="runScripts" 
                checked={steps.runScripts}
                onCheckedChange={(checked) => updateStep('runScripts', checked === true)}
              />
              <div className="grid gap-1.5 w-full">
                <Label htmlFor="runScripts" className="font-semibold">Run the Database Setup Scripts</Label>
                <p className="text-sm text-gray-500 mb-4">
                  In your Supabase project, go to the SQL Editor and run each of these scripts in order. These scripts will create all the necessary tables, relationships, and security policies.
                </p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="timestamps">
                    <AccordionTrigger>1. Setup Timestamp Function</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.setupTimestampFunction}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="profiles">
                    <AccordionTrigger>2. Create Profiles Table</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.createProfilesTable}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="categories">
                    <AccordionTrigger>3. Create Categories Table</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.createCategoriesTable}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="products">
                    <AccordionTrigger>4. Create Products Table</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.createProductsTable}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="productImages">
                    <AccordionTrigger>5. Create Product Images Table</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.createProductImagesTable}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="messages">
                    <AccordionTrigger>6. Create Messages Table</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.createMessagesTable}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="purchases">
                    <AccordionTrigger>7. Create Purchases Table</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.createPurchasesTable}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="indexes">
                    <AccordionTrigger>8. Create Indexes</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.createIndexes}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="seed">
                    <AccordionTrigger>9. Seed Categories Data</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-60">
                        <pre className="text-xs">{scripts.seedCategories}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <Separator />
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="setupStorage" 
                checked={steps.setupStorage}
                onCheckedChange={(checked) => updateStep('setupStorage', checked === true)}
              />
              <div className="grid gap-1.5">
                <Label htmlFor="setupStorage" className="font-semibold">Create Storage Bucket</Label>
                <p className="text-sm text-gray-500">
                  Go to Storage in your Supabase dashboard and create a new bucket named "product-images". Make sure to set it as public.
                </p>
                <ol className="text-sm list-decimal list-inside space-y-1 mt-2">
                  <li>Click on "Storage" in the sidebar</li>
                  <li>Click "Create a new bucket"</li>
                  <li>Enter "product-images" as the name</li>
                  <li>Enable "Public bucket" option</li>
                  <li>Click "Create bucket"</li>
                </ol>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Then run this SQL script to set up storage policies:
                  </p>
                  <div className="bg-gray-50 rounded-md p-3 overflow-auto mt-2 max-h-60">
                    <pre className="text-xs">{scripts.createStoragePolicies}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("create")}>
                Back
              </Button>
              <Button onClick={() => setActiveTab("connect")} disabled={!steps.runScripts || !steps.setupStorage}>
                Next: Connect
              </Button>
            </div>
          </TabsContent>
          
          {/* Tab 3: Connect */}
          <TabsContent value="connect" className="space-y-4 mt-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="configureClient" 
                checked={steps.configureClient}
                onCheckedChange={(checked) => updateStep('configureClient', checked === true)}
              />
              <div className="grid gap-1.5 w-full">
                <Label htmlFor="configureClient" className="font-semibold">Configure the Supabase Client</Label>
                <p className="text-sm text-gray-500 mb-4">
                  Get your Supabase URL and anon key from your project settings, then update the supabaseClient.ts file with these values.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">1. Go to your Supabase project dashboard</p>
                    <p className="text-sm mb-2">2. Click on the "Settings" icon (gear) in the sidebar</p>
                    <p className="text-sm mb-2">3. Select "API" from the settings menu</p>
                    <p className="text-sm mb-2">4. Find your Project URL and anon key under "Project API keys"</p>
                    <p className="text-sm mb-2">5. Copy these values and update the file below:</p>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">ui/src/utils/supabaseClient.ts</h4>
                    <div className="mb-4">
                      <Label htmlFor="supabaseUrl" className="text-xs">Supabase URL</Label>
                      <Input 
                        id="supabaseUrl"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="https://your-project-id.supabase.co"
                        className="text-xs mt-1 font-mono"
                      />
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="supabaseKey" className="text-xs">Supabase Anon Key</Label>
                      <Input 
                        id="supabaseKey"
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                        placeholder="your-supabase-anon-key"
                        className="text-xs mt-1 font-mono"
                      />
                    </div>
                    <pre className="text-xs bg-gray-100 p-3 rounded">
{`import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

const supabaseUrl = '${supabaseUrl || 'YOUR_SUPABASE_URL'}';
const supabaseAnonKey = '${supabaseKey || 'YOUR_SUPABASE_ANON_KEY'}';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);`}
                    </pre>
                    <Button 
                      onClick={saveClientConfig} 
                      className="mt-2" 
                      disabled={!supabaseUrl || !supabaseKey}
                      size="sm"
                    >
                      Save Configuration
                    </Button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
                    <h4 className="text-sm font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Important Note
                    </h4>
                    <p className="text-sm mt-1">
                      In a production app, you would need to update the supabaseClient.ts file with your credentials. For this demo, entering the values here will simulate that configuration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("configure")}>
                Back
              </Button>
              <Button onClick={onComplete} disabled={!allStepsCompleted}>
                Complete Setup
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
