# UI/UX Reviewer Agent

## Overview

The UI/UX Reviewer is a specialized agent that provides expert feedback on the visual design, user experience, and accessibility of web pages and React features. This agent performs comprehensive audits of user interfaces to ensure they meet modern design standards, usability best practices, and accessibility guidelines.

## When to Use

Use the UI/UX Reviewer agent when you need:

- **Post-Implementation Review**: After implementing UI components or completing feature development
- **Design Validation**: When making design changes or updates to existing interfaces
- **Accessibility Audit**: To ensure compliance with WCAG guidelines and accessibility standards
- **Staging Review**: When a feature is deployed to staging and needs validation
- **User Experience Assessment**: To identify usability issues and improvement opportunities

## What It Analyzes

### 1. Visual Design
- **Layout & Spacing**: Consistency in margins, padding, and alignment
- **Typography**: Font choices, sizes, hierarchy, and readability
- **Color Scheme**: Color contrast, brand consistency, and visual harmony
- **Component Design**: Button styles, form elements, cards, and other UI components
- **Responsive Design**: Mobile, tablet, and desktop layouts

### 2. User Experience (UX)
- **Navigation**: Ease of navigation and information architecture
- **User Flows**: Logical progression through features and tasks
- **Feedback & States**: Loading states, error messages, success confirmations
- **Interactions**: Hover states, click targets, animations, and transitions
- **Form Usability**: Input validation, error handling, and completion guidance
- **Information Hierarchy**: Content organization and visual priorities

### 3. Accessibility
- **WCAG Compliance**: Level A, AA, and AAA guidelines
- **Keyboard Navigation**: Tab order and keyboard-only interaction
- **Screen Reader Support**: ARIA labels, semantic HTML, and alt text
- **Color Contrast**: Text and background color ratios
- **Focus Indicators**: Visible focus states for interactive elements
- **Alternative Text**: Images, icons, and visual content descriptions

### 4. Performance & Technical
- **Rendering Performance**: Page load times and rendering speed
- **Asset Optimization**: Image sizes, lazy loading, and resource efficiency
- **Browser Compatibility**: Cross-browser testing and compatibility issues
- **Mobile Optimization**: Touch targets, viewport settings, and mobile-specific concerns

## Example Use Cases

### After Feature Implementation
```
User: "I just finished implementing the new checkout form. Can you review it?"
Response: Launch ui-ux-reviewer to analyze the checkout form's design, UX, and accessibility.
```

### Staging Deployment Review
```
User: "The dashboard is deployed to staging. Let's make sure it looks good."
Response: Launch ui-ux-reviewer to evaluate the dashboard's UI/UX using the staging URL.
```

### Mobile Update Review
```
User: "I've updated the mobile navigation. Here's the URL: https://staging.example.com"
Response: Launch ui-ux-reviewer to review the mobile navigation's design and usability.
```

### Accessibility Check
```
User: "Can you check if our landing page is accessible?"
Response: Launch ui-ux-reviewer to perform a comprehensive accessibility audit.
```

## Review Output

The UI/UX Reviewer provides:

1. **Executive Summary**: High-level overview of findings
2. **Critical Issues**: Problems that need immediate attention
3. **Design Feedback**: Specific recommendations for visual improvements
4. **UX Recommendations**: Suggestions for better user experience
5. **Accessibility Report**: WCAG compliance issues and fixes
6. **Best Practices**: Industry standards and modern design patterns
7. **Priority Ratings**: Categorized by severity (Critical, High, Medium, Low)

## Integration with Rivio

For the Rivio trade credit insurance platform, the UI/UX Reviewer can assess:

- **Dashboard Visualization**: Chart clarity, data presentation, and metric visibility
- **Buyer Management Interface**: Table usability, filtering, and search functionality
- **Alert System**: Critical invoice alerts and notification design
- **Forms & Inputs**: Credit limit inputs, policy management forms
- **Responsive Behavior**: Mobile access for on-the-go compliance monitoring
- **Color Coding System**: Accessibility of red/green/yellow risk indicators
- **Navigation**: Ease of moving between Dashboard, Buyers, Policies, and Reports

## How It Works

1. **Automated Analysis**: Uses Playwright to render and interact with pages
2. **Visual Inspection**: Screenshots and visual regression testing
3. **Code Review**: Examines React components, HTML structure, and CSS
4. **Accessibility Testing**: Automated WCAG checks and manual verification
5. **Cross-device Testing**: Simulates different screen sizes and devices
6. **Comprehensive Report**: Generates actionable feedback with examples

## Best Practices

- Run UI/UX reviews after completing significant UI changes
- Address Critical and High priority issues before deployment
- Use the agent iteratively during development, not just at the end
- Combine automated findings with user testing for best results
- Maintain a consistent design system based on review feedback

## Tools Available

The ui-ux-reviewer agent has access to:
- All standard development tools (Read, Edit, Write, Glob, Grep)
- Playwright for browser automation and testing
- Screenshot capture and visual analysis
- Accessibility testing libraries
- Code analysis tools

## Notes

- The agent provides objective feedback based on industry standards
- Recommendations are prioritized by impact and implementation effort
- Some design choices are subjective; use judgment when applying feedback
- Regular reviews help maintain design consistency across features
