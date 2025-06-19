import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function GuidePage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Guide</h1>
      <Card>
        <CardContent className="p-6">
          <div className="prose max-w-none">
            <h2>Getting Started with AntiDetect Browser</h2>
            <p>
              Welcome to AntiDetect Browser! This guide will help you understand
              the basic features and functionality of our platform.
            </p>

            <h3>Creating Your First Profile</h3>
            <p>
              Browser profiles allow you to maintain separate browsing
              identities. Follow these steps to create your first profile:
            </p>
            <ol>
              <li>Navigate to the Profiles page</li>
              <li>Click the "Add Profile" button</li>
              <li>Configure your profile settings (OS, browser, etc.)</li>
              <li>Save your profile</li>
              <li>Launch your new profile to start browsing</li>
            </ol>

            <h3>Setting Up Proxies</h3>
            <p>
              To enhance your anonymity, you can configure proxies for your
              profiles. Here's how:
            </p>
            <ol>
              <li>Go to the Network page</li>
              <li>Click "Add Proxy"</li>
              <li>Enter your proxy details</li>
              <li>Assign the proxy to your profiles</li>
            </ol>

            <p>
              For more detailed instructions, please refer to our comprehensive
              documentation or contact support.
            </p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Frequently Asked Questions
      </h2>
      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                What is browser fingerprinting?
              </AccordionTrigger>
              <AccordionContent>
                Browser fingerprinting is a technique used to track and identify
                users based on their browser's unique characteristics. These
                include your browser version, operating system, installed
                plugins, screen resolution, timezone, language settings, and
                more. When combined, these attributes create a unique
                "fingerprint" that can be used to identify and track you across
                websites.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                How does AntiDetect Browser protect me?
              </AccordionTrigger>
              <AccordionContent>
                AntiDetect Browser allows you to create multiple browser
                profiles with unique fingerprints. Each profile emulates a
                specific browser configuration, making it appear as if you're
                using a completely different device. This helps prevent tracking
                and identification across different websites and services.
                Additionally, we provide WebRTC protection, canvas fingerprint
                spoofing, and timezone spoofing to further enhance your privacy.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Can I use my existing bookmarks and extensions?
              </AccordionTrigger>
              <AccordionContent>
                Yes, you can import your bookmarks from other browsers.
                Extensions can also be installed in each profile independently,
                allowing you to maintain different sets of extensions for
                different browsing purposes. However, be aware that some
                extensions may compromise your anonymity by revealing
                identifying information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Do I need to use a proxy with AntiDetect Browser?
              </AccordionTrigger>
              <AccordionContent>
                While not strictly required, using a proxy or VPN with
                AntiDetect Browser is highly recommended for maximum anonymity.
                Your IP address is a crucial part of your online identity, and
                without masking it, websites can still potentially identify you
                despite browser fingerprinting protection. We offer seamless
                proxy integration to make this process as simple as possible.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                How many profiles can I create?
              </AccordionTrigger>
              <AccordionContent>
                The number of profiles you can create depends on your
                subscription plan. Basic users can create up to 5 profiles,
                while Premium users get unlimited profiles. Each profile
                operates independently and has its own settings, cookies, cache,
                and browsing history.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Video Tutorials
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">
                Video tutorial available after login
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              A complete overview of AntiDetect Browser's basic features.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Advanced Profile Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">
                Video tutorial available after login
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Learn how to configure advanced fingerprinting settings.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Proxy Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">
                Video tutorial available after login
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              How to set up and use proxies with your browser profiles.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
