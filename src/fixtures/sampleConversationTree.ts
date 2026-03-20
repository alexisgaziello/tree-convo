import type { ConversationNodeInput } from '../graph/conversationSchema';

export const sampleConversationTree: ConversationNodeInput = {
  id: 'root',
  type: 'user',
  text: 'Plan a launch strategy for a new productivity app.',
  children: [
    {
      id: 'a1',
      type: 'agent',
      text: 'Here is a high-level launch strategy with phases and channels.',
      children: [
        {
          id: 'u2',
          type: 'user',
          text: 'Make it more focused on organic growth.',
          children: [
            {
              id: 'a2',
              type: 'agent',
              text: 'Here is an organic-first plan centered on content, referrals, and community.',
              children: [
                {
                  id: 'u3',
                  type: 'user',
                  text: 'What would a 30-day execution plan look like?',
                  children: [
                    {
                      id: 'a3',
                      type: 'agent',
                      text: 'Week-by-week milestones for the first 30 days.',
                      children: [],
                    },
                    {
                      id: 'a4',
                      type: 'agent',
                      text: 'Alternative 30-day plan optimized for a tiny team.',
                      children: [
                        {
                          id: 'u4',
                          type: 'user',
                          text: 'Expand week 2 into daily actions.',
                          children: [
                            {
                              id: 'a5',
                              type: 'agent',
                              text: 'Detailed day-by-day breakdown for week 2.',
                              children: [],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'a6',
              type: 'agent',
              text: 'Alternative organic strategy focused on partnerships and waitlist loops.',
              children: [
                {
                  id: 'u5',
                  type: 'user',
                  text: 'Compare this with the content-led approach.',
                  children: [
                    {
                      id: 'a7',
                      type: 'agent',
                      text: 'Comparison of tradeoffs, speed, and effort across both approaches.',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'u6',
          type: 'user',
          text: 'Instead, make it enterprise-focused.',
          children: [
            {
              id: 'a8',
              type: 'agent',
              text: 'Enterprise GTM plan with outbound, pilots, and stakeholder mapping.',
              children: [
                {
                  id: 'u7',
                  type: 'user',
                  text: 'Can you condense this into a one-page brief?',
                  children: [
                    {
                      id: 'a9',
                      type: 'agent',
                      text: 'One-page executive brief version.',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'a10',
      type: 'agent',
      text: 'Alternative answer framed as a funnel from awareness to activation.',
      children: [
        {
          id: 'u8',
          type: 'user',
          text: 'This is closer. Make the tone more concise.',
          children: [
            {
              id: 'a11',
              type: 'agent',
              text: 'Condensed funnel-based strategy.',
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
