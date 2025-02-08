import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Filter, RefreshCw, MessageSquare, Check, X } from 'lucide-react';

interface Dispute {
  id: string;
  status: string;
  amount: number;
  currency: string;
  reason: string;
  buyer_email: string;
  created_at: string;
  response_due_date: string;
  details: {
    tracking_number?: string;
    shipping_carrier?: string;
    shipping_date?: string;
    buyer_complaint: string;
    order_details: {
      item_name: string;
      item_price: number;
      order_date: string;
    }
  }
}

const DisputeDashboard = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [processingResponse, setProcessingResponse] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');

  // Mock data with more detail for AI processing
  const mockDisputes = [
    {
      id: 'PP-D-1234',
      status: 'OPEN',
      amount: 299.99,
      currency: 'USD',
      reason: 'Item not received',
      buyer_email: 'buyer@example.com',
      created_at: '2025-02-08T10:30:00Z',
      response_due_date: '2025-02-15T10:30:00Z',
      details: {
        tracking_number: 'USP123456789',
        shipping_carrier: 'USPS',
        shipping_date: '2025-02-01',
        buyer_complaint: "I never received my package. It's been a week since the expected delivery date.",
        order_details: {
          item_name: 'Wireless Headphones',
          item_price: 299.99,
          order_date: '2025-01-28'
        }
      }
    },
    {
      id: 'PP-D-5678',
      status: 'UNDER_REVIEW',
      amount: 149.50,
      currency: 'USD',
      reason: 'Item not as described',
      buyer_email: 'customer@example.com',
      created_at: '2025-02-07T15:45:00Z',
      response_due_date: '2025-02-14T15:45:00Z',
      details: {
        buyer_complaint: 'The product color is different from what was advertised. I received a blue one instead of black.',
        order_details: {
          item_name: 'Designer Watch',
          item_price: 149.50,
          order_date: '2025-02-05'
        }
      }
    }
  ];

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setDisputes(mockDisputes);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch disputes');
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const generateAIResponse = async (dispute: Dispute) => {
    setProcessingResponse(true);
    try {
      // Here we would make an API call to our AI service
      // For example, using OpenAI's API:
      /*
      const response = await fetch('your-ai-api-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatePromptFromDispute(dispute),
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      const aiSuggestion = data.choices[0].text;
      */

      // Mock AI response based on dispute type
      const aiSuggestion = dispute.reason === 'Item not received' 
        ? `Dear ${dispute.buyer_email},

I understand your concern about not receiving your ${dispute.details.order_details.item_name}. I can confirm that your order was shipped on ${dispute.details.shipping_date} via ${dispute.details.shipping_carrier} with tracking number ${dispute.details.tracking_number}.

According to our records, the package is still in transit. You can track your delivery at ${dispute.details.shipping_carrier}'s website using the tracking number provided.

If you don't receive the package within the next 2 business days, please let us know and we'll initiate an investigation with the carrier.

Best regards,
[Your Store Name]`
        : `Dear ${dispute.buyer_email},

I apologize for the inconvenience regarding your ${dispute.details.order_details.item_name}. I understand that you received a blue item instead of the black one you ordered.

We take product accuracy very seriously and I'd like to resolve this situation immediately. I can offer you the following options:

1. Return the item for a full refund (we'll cover shipping costs)
2. Keep the item with a 30% discount
3. Exchange it for the correct color (we'll expedite shipping)

Please let me know which option you prefer and we'll process it right away.

Best regards,
[Your Store Name]`;

      setAiResponse(aiSuggestion);
      setEditedResponse(aiSuggestion);
    } catch (error) {
      setError('Failed to generate AI response');
    } finally {
      setProcessingResponse(false);
    }
  };

  const handleRespond = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    generateAIResponse(dispute);
  };

  const handleSubmitResponse = async () => {
    try {
      // Here we would send the response to PayPal's API
      console.log('Submitting response:', editedResponse);
      setSelectedDispute(null);
      setAiResponse('');
      setEditedResponse('');
    } catch (error) {
      setError('Failed to submit response');
    }
  };

  const handleCancelResponse = () => {
    setSelectedDispute(null);
    setAiResponse('');
    setEditedResponse('');
  };

  const filteredDisputes = disputes.filter(dispute =>
    dispute.id.toLowerCase().includes(filter.toLowerCase()) ||
    dispute.buyer_email.toLowerCase().includes(filter.toLowerCase()) ||
    dispute.reason.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>PayPal Disputes</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setDisputes(mockDisputes);
                  setLoading(false);
                }, 1000);
              }}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Filter disputes..."
              value={filter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDisputes.map((dispute) => (
                      <tr key={dispute.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dispute.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            dispute.status === 'OPEN' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {dispute.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dispute.currency} {dispute.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dispute.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dispute.buyer_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(dispute.response_due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRespond(dispute)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Respond
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedDispute && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium mb-4">AI-Generated Response</h3>
                  {processingResponse ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                  ) : (
                    <>
                      <textarea
                        className="w-full h-64 p-4 mb-4 border rounded-lg"
                        value={editedResponse}
                        onChange={(e) => setEditedResponse(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={handleCancelResponse}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitResponse}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Submit Response
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DisputeDashboard;