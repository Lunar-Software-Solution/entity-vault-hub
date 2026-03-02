---
title: "Project Structure"
description: "Detailed file and folder map for entity-vault-hub"
---

# Project Structure

## Directory Tree

```
entity-vault-hub/
├── docs/
│   ├── DOCUMENTATION.md
│   ├── architecture.md
│   ├── configuration.md
│   ├── contributing.md
│   ├── getting-started.md
│   ├── index.md
│   └── project-structure.md
├── public/
│   ├── favicon.ico
│   ├── favicon.png
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── brax-logo.png
│   │   ├── brax-logo.svg
│   │   └── braxtech-logo.png
│   ├── components/
│   │   ├── ai/
│   │   │   └── AIChatAssistant.tsx
│   │   ├── captable/
│   │   │   ├── CapTableOverview.tsx
│   │   │   ├── ShareClassForm.tsx
│   │   │   ├── ShareholderEntityAffiliationsManager.tsx
│   │   │   ├── ShareholderForm.tsx
│   │   │   └── TransactionForm.tsx
│   │   ├── contracts/
│   │   │   ├── AnalyzeContractUpload.tsx
│   │   │   ├── ContractFileUpload.tsx
│   │   │   ├── ContractSummary.tsx
│   │   │   ├── DocuSealSync.tsx
│   │   │   └── PdfViewerDialog.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardSection.tsx
│   │   │   └── StatCard.tsx
│   │   ├── documents/
│   │   │   ├── BulkDocumentUpload.tsx
│   │   │   ├── DocumentFileUpload.tsx
│   │   │   ├── DocumentSummary.tsx
│   │   │   ├── InboundApprovalDialog.tsx
│   │   │   └── InboundQueueSection.tsx
│   │   ├── entity-detail/
│   │   │   ├── LinkedAccountantFirms.tsx
│   │   │   ├── LinkedAddresses.tsx
│   │   │   ├── LinkedAdvisors.tsx
│   │   │   ├── LinkedAuditors.tsx
│   │   │   ├── LinkedBankAccounts.tsx
│   │   │   ├── LinkedConsultants.tsx
│   │   │   ├── LinkedContracts.tsx
│   │   │   ├── LinkedCreditCards.tsx
│   │   │   ├── LinkedDirectorsUbos.tsx
│   │   │   ├── LinkedDocuments.tsx
│   │   │   ├── LinkedEmailAddresses.tsx
│   │   │   ├── LinkedFilingTasks.tsx
│   │   │   ├── LinkedFilings.tsx
│   │   │   ├── LinkedLawFirms.tsx
│   │   │   ├── LinkedPhoneNumbers.tsx
│   │   │   ├── LinkedRegistrationAgents.tsx
│   │   │   ├── LinkedSocialMedia.tsx
│   │   │   ├── LinkedSoftware.tsx
│   │   │   ├── LinkedTaxIds.tsx
│   │   │   └── LinkedWebsites.tsx
│   │   ├── feedback/
│   │   │   ├── FeedbackButton.tsx
│   │   │   └── ScreenshotAnnotator.tsx
│   │   ├── filings/
│   │   │   ├── CalendarDayPopover.tsx
│   │   │   └── FilingsCalendar.tsx
│   │   ├── forms/
│   │   │   ├── AccountantFirmForm.tsx
│   │   │   ├── AddressEntityAffiliationsManager.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   ├── AdvisorForm.tsx
│   │   │   ├── AuditorForm.tsx
│   │   │   ├── BankAccountForm.tsx
│   │   │   ├── CloudflareWebsiteImporter.tsx
│   │   │   ├── ConsultantForm.tsx
│   │   │   ├── ContractEntityAffiliationsManager.tsx
│   │   │   ├── ContractForm.tsx
│   │   │   ├── CreditCardForm.tsx
│   │   │   ├── DirectorUboForm.tsx
│   │   │   ├── EmailEntityAffiliationsManager.tsx
│   │   │   ├── EntityAffiliationsManager.tsx
│   │   │   ├── EntityDocumentForm.tsx
│   │   │   ├── EntityFilingForm.tsx
│   │   │   ├── EntityForm.tsx
│   │   │   ├── EntitySoftwareForm.tsx
│   │   │   ├── FilingTaskForm.tsx
│   │   │   ├── FilingTypeForm.tsx
│   │   │   ├── IdDocumentUpload.tsx
│   │   │   ├── LawFirmForm.tsx
│   │   │   ├── MultipleIdDocuments.tsx
│   │   │   ├── PhoneNumberEntityAffiliationsManager.tsx
│   │   │   ├── PhoneNumberForm.tsx
│   │   │   ├── RegistrationAgentForm.tsx
│   │   │   ├── SocialMediaForm.tsx
│   │   │   ├── TaskDocumentUpload.tsx
│   │   │   ├── TaxIdForm.tsx
│   │   │   ├── WebsiteEntityAffiliationsManager.tsx
│   │   │   └── WebsiteForm.tsx
│   │   ├── layout/
│   │   │   ├── EntityFilter.tsx
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── ProfileDialog.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── sections/
│   │   │   ├── AddressesSection.tsx
│   │   │   ├── BankAccountsSection.tsx
│   │   │   ├── CapTableSection.tsx
│   │   │   ├── ContractsSection.tsx
│   │   │   ├── CreditCardsSection.tsx
│   │   │   ├── DirectorsUboSection.tsx
│   │   │   ├── DocumentsSection.tsx
│   │   │   ├── EmailSection.tsx
│   │   │   ├── EntitySection.tsx
│   │   │   ├── FilingsSection.tsx
│   │   │   ├── MerchantAccountsSection.tsx
│   │   │   ├── PhoneNumbersSection.tsx
│   │   │   ├── ServiceProvidersSection.tsx
│   │   │   ├── SettingsSection.tsx
│   │   │   ├── SocialMediaSection.tsx
│   │   │   ├── SoftwareSection.tsx
│   │   │   ├── TaxIdsSection.tsx
│   │   │   ├── UserManagementSection.tsx
│   │   │   └── WebsitesSection.tsx
│   │   ├── settings/
│   │   │   ├── ApiSection.tsx
│   │   │   ├── CronJobsSection.tsx
│   │   │   └── TrustedDevicesSection.tsx
│   │   ├── shared/
│   │   │   ├── AddressAutocomplete.tsx
│   │   │   ├── AvatarEditDialog.tsx
│   │   │   ├── BraxLogo.tsx
│   │   │   ├── BulkActionsToolbar.tsx
│   │   │   ├── CardBrandIcon.tsx
│   │   │   ├── ColumnMultiFilter.tsx
│   │   │   ├── CompanyLogo.tsx
│   │   │   ├── CopyButton.tsx
│   │   │   ├── DeleteConfirmDialog.tsx
│   │   │   ├── GravatarAvatar.tsx
│   │   │   └── IdDocumentsManager.tsx
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── use-toast.ts
│   │   ├── NavLink.tsx
│   │   └── ProtectedRoute.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAuth.tsx
│   │   ├── useInboundQueue.ts
│   │   ├── usePortalData.ts
│   │   ├── usePortalMutations.ts
│   │   ├── useProfileEnrichment.ts
│   │   └── useUserRole.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── auditLogUtils.ts
│   │   ├── cardBrandUtils.ts
│   │   ├── countries.ts
│   │   ├── filingUtils.ts
│   │   ├── formSchemas.ts
│   │   ├── gravatar.ts
│   │   ├── states.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── EntityDetail.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   └── ResetPassword.tsx
│   ├── test/
│   │   ├── example.test.ts
│   │   └── setup.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   ├── functions/
│   │   ├── ai-assistant/
│   │   │   └── index.ts
│   │   ├── analyze-bulk-documents/
│   │   │   └── index.ts
│   │   ├── analyze-contract/
│   │   │   └── index.ts
│   │   ├── analyze-id-document/
│   │   │   └── index.ts
│   │   ├── check-trusted-device/
│   │   │   └── index.ts
│   │   ├── enrich-profile/
│   │   │   └── index.ts
│   │   ├── fetch-cloudflare-dns/
│   │   │   └── index.ts
│   │   ├── fetch-docuseal-contracts/
│   │   │   └── index.ts
│   │   ├── fetch-social-profile/
│   │   │   └── index.ts
│   │   ├── generate-recurring-tasks/
│   │   │   └── index.ts
│   │   ├── list-cron-jobs/
│   │   │   └── index.ts
│   │   ├── list-trusted-devices/
│   │   │   └── index.ts
│   │   ├── public-api/
│   │   │   └── index.ts
│   │   ├── receive-inbound-email/
│   │   │   └── index.ts
│   │   ├── register-trusted-device/
│   │   │   └── index.ts
│   │   ├── revoke-trusted-device/
│   │   │   └── index.ts
│   │   ├── send-2fa-code/
│   │   │   └── index.ts
│   │   ├── send-invitation/
│   │   │   └── index.ts
│   │   ├── send-task-reminders/
│   │   │   └── index.ts
│   │   ├── submit-feedback/
│   │   │   └── index.ts
│   │   ├── summarize-contract/
│   │   │   └── index.ts
│   │   ├── summarize-document/
│   │   │   └── index.ts
│   │   ├── toggle-cron-job/
│   │   │   └── index.ts
│   │   ├── verify-2fa-code/
│   │   │   └── index.ts
│   │   └── deno.json
│   ├── migrations/
│   │   ├── 20260122132132_c53fff11-dbce-491c-9d61-d7d600c4acdb.sql
│   │   ├── 20260122140411_8b19024c-4e18-4efd-855f-b53dada23734.sql
│   │   ├── 20260122141249_d02bad83-4d94-4a87-8923-803c2626a9b8.sql
│   │   ├── 20260122202734_124deade-5a8c-48ef-b48d-1d2c40b6106b.sql
│   │   ├── 20260122211329_a0cbb415-0364-49bc-86fe-d1dc94e76533.sql
│   │   ├── 20260122212002_701b08a4-cc59-46fd-b0ba-d29aefb68c86.sql
│   │   ├── 20260122212805_228ae9cb-551f-49fb-ae82-ca6b8b8c375e.sql
│   │   ├── 20260122213427_71f8ea9f-32ef-4a83-adfd-5666f8e1bb89.sql
│   │   ├── 20260122214511_c19b7f65-b243-48e1-965b-e7211315f616.sql
│   │   ├── 20260122215221_64a016a5-69bd-4123-8e47-fe8b791f9af2.sql
│   │   ├── 20260122221824_1e141506-a823-4826-9407-3e2a3f6a3ebc.sql
│   │   ├── 20260122223013_7aae3969-9675-4b9b-a96c-08cf67fce646.sql
│   │   ├── 20260122224207_dbc43519-adee-48df-a480-f734bda98da0.sql
│   │   ├── 20260122230633_9c0bb64a-eb42-4ece-99f8-f4db10a52362.sql
│   │   ├── 20260122231219_c0632120-9e28-4e66-91d5-f4aecf5b9c26.sql
│   │   ├── 20260122233409_96283a04-9d30-453f-a31d-f4b762b45131.sql
│   │   ├── 20260122233730_28c43e9e-dae6-4e6d-af33-2bd633286f51.sql
│   │   ├── 20260122234019_b84e04d1-b7e6-4c2a-b5c3-25c8cb6bba49.sql
│   │   ├── 20260122235359_18cc8d8c-a90a-4363-8ad5-6c1e7ceb606e.sql
│   │   ├── 20260123000549_632004bd-1cf6-47e5-93a1-2211551a69ee.sql
│   │   ├── 20260123001130_81529f75-c5a3-4311-8734-751b01343d19.sql
│   │   ├── 20260123001611_94aadef8-46bc-4eba-acde-f6938d60d5bd.sql
│   │   ├── 20260123002950_d3c54793-adbd-4754-b59d-7bbb89fbecf9.sql
│   │   ├── 20260123003332_a50b5391-e9de-42d3-b13f-b93892a3154c.sql
│   │   ├── 20260123003403_212dff3b-0ffe-4042-b4ef-ca2bd7c710fc.sql
│   │   ├── 20260123085148_586043ef-07c0-4409-84b4-ba546224265e.sql
│   │   ├── 20260123094142_7a0921a1-b63b-426c-af2b-63b44a1c0868.sql
│   │   ├── 20260123094445_45f93238-72e1-43a0-9b30-6ed1aa58d074.sql
│   │   ├── 20260123135312_c4b7b1e6-1268-4ac9-9caa-776c932abacd.sql
│   │   ├── 20260123140255_9923f5d9-112d-4be4-a42b-cfa0662ee21b.sql
│   │   ├── 20260123140814_0b21490b-d978-45b0-8f91-02e874b3adeb.sql
│   │   ├── 20260123141804_d9d9c3f9-e95d-4f02-8fe8-948d01be7053.sql
│   │   ├── 20260123172430_dbc7bd2d-96ea-4da9-bda5-5cc79472b3b6.sql
│   │   ├── 20260123173024_7e6b5271-32ea-4189-8d9e-08179a3114a8.sql
│   │   ├── 20260123173612_2d77fb6d-2743-4855-b7bc-bab2ee366849.sql
│   │   ├── 20260123173732_b02982f7-d760-48f4-bfb0-48a8c874ad47.sql
│   │   ├── 20260123174708_b921ab79-9c33-4afa-90ee-3bf2c4975180.sql
│   │   ├── 20260123175032_51992c50-9fce-4d4c-bf53-d995a225cd5a.sql
│   │   ├── 20260123175401_20b2b1b4-fbb6-41f5-9f3b-9f1067a23856.sql
│   │   ├── 20260123175628_049547b8-8f57-4771-89b5-1810748fd786.sql
│   │   ├── 20260123181256_36207d87-0e7b-4ad4-a68b-b99aab81b93b.sql
│   │   ├── 20260123181605_7b095b02-8861-4419-a7c9-0b5ac8471af9.sql
│   │   ├── 20260123184729_a08f0653-2b27-4602-8387-5cfdb80b68bb.sql
│   │   ├── 20260123184813_02094953-79c4-4eb7-b372-702c282d5ee0.sql
│   │   ├── 20260123185140_30c9c9b5-c17a-4e5e-bb88-9e717d0f4170.sql
│   │   ├── 20260124072128_faf4d6b2-3af6-4a26-905d-3d24d9a90db2.sql
│   │   ├── 20260124081724_fbbc47c9-1d7a-49fd-92db-6c23419e64ae.sql
│   │   ├── 20260124083645_d206555e-2218-48e3-9864-acad5a93ec7b.sql
│   │   ├── 20260124121931_18c04fd4-e31d-4587-abc1-0b4b6e94412a.sql
│   │   ├── 20260124123548_34acc9a5-b878-4ef1-9492-5b392486b30c.sql
│   │   ├── 20260124125418_df624c59-a0d6-447b-b250-4a01971a6503.sql
│   │   ├── 20260124134053_c66bd770-e2c8-4153-9f40-7d0f6d963809.sql
│   │   ├── 20260124182046_c0f85907-958d-4fb6-b0dd-d47af519fe10.sql
│   │   ├── 20260125085801_5deb3b5e-e430-47c9-b797-04c58595cffa.sql
│   │   ├── 20260125090920_0cfbf659-d5bf-4ea2-a622-e6c0b8dd0138.sql
│   │   ├── 20260125091718_2cbef2e4-d29b-4475-8bf1-5337ebccc881.sql
│   │   ├── 20260125094030_9e2f9217-2982-47ef-ad61-f16c1b20438d.sql
│   │   ├── 20260125105853_cc8ab229-8c44-4916-aba3-a47ae713daa1.sql
│   │   ├── 20260125132447_f7ba2b5e-2b04-402e-a234-e1047c0075a0.sql
│   │   ├── 20260125165347_7a255bab-fd75-4d15-a9c8-95009a6cd583.sql
│   │   ├── 20260125190119_2a5ba9f3-a041-4b36-b1bf-e9671faa9177.sql
│   │   ├── 20260125190212_1aa2a640-9f38-42f7-a256-559e834e0fe8.sql
│   │   ├── 20260125194736_3032ed52-e923-4837-88bf-90736c13d027.sql
│   │   ├── 20260125200432_4b944c22-0ee0-453d-b0c6-207bd7659e18.sql
│   │   ├── 20260125200616_be5ad584-c45f-4afe-b4f4-6dcf36a2a21b.sql
│   │   ├── 20260126084713_ddea9f49-37d1-4836-a7bb-bd227249c89c.sql
│   │   ├── 20260126085632_ec2f1d6f-69f2-45f9-b900-31b1ba0cf6d7.sql
│   │   ├── 20260126103746_fc9d6f87-961e-484a-8a86-560f19a98df0.sql
│   │   ├── 20260127100337_f5083b59-44ed-4259-a629-afc77812bd6a.sql
│   │   ├── 20260129094440_fc2cd652-b445-4ec0-ac27-e2f65a47cf58.sql
│   │   ├── 20260129101150_09e85c06-5523-4bd6-a871-fd70df45a868.sql
│   │   ├── 20260129104823_10fdc43a-4e9c-4260-ba99-846228446c9a.sql
│   │   ├── 20260129124625_f021d694-b84b-457a-84bb-5f909f11abdb.sql
│   │   ├── 20260129141311_41757791-dba1-4f2c-b71a-ebaaaafcdc03.sql
│   │   ├── 20260129141845_b7e1b82c-efed-4de7-99b8-777b376bcd20.sql
│   │   ├── 20260129144104_b71a4b56-114d-4afe-9a47-4bd2951339ec.sql
│   │   ├── 20260202121557_8606d644-dd79-4fde-8c85-db13765a389d.sql
│   │   ├── 20260202125450_52cf2981-a963-40a0-9baf-70ef2054cd9f.sql
│   │   ├── 20260203135342_d32c3e1f-464a-45d8-bb25-2fa51aef55fe.sql
│   │   ├── 20260211170509_bd782440-05ed-408d-82e1-6302385c2a17.sql
│   │   └── 20260211183615_482434b6-00de-4d80-9544-3e01df68efb9.sql
│   └── config.toml
├── README.md
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts

```

## Source Directories

### `src/`

Primary application source code.



## Key Entry Points

| File | Description |
|------|-------------|
| `supabase/functions/ai-assistant/index.ts` | Application entry point |
| `supabase/functions/analyze-bulk-documents/index.ts` | Application entry point |
| `supabase/functions/analyze-contract/index.ts` | Application entry point |
| `supabase/functions/analyze-id-document/index.ts` | Application entry point |
| `supabase/functions/check-trusted-device/index.ts` | Application entry point |
| `supabase/functions/enrich-profile/index.ts` | Application entry point |
| `supabase/functions/fetch-cloudflare-dns/index.ts` | Application entry point |
| `supabase/functions/fetch-docuseal-contracts/index.ts` | Application entry point |
| `supabase/functions/fetch-social-profile/index.ts` | Application entry point |
| `supabase/functions/generate-recurring-tasks/index.ts` | Application entry point |
| `supabase/functions/list-cron-jobs/index.ts` | Application entry point |
| `supabase/functions/list-trusted-devices/index.ts` | Application entry point |
| `supabase/functions/public-api/index.ts` | Application entry point |
| `supabase/functions/receive-inbound-email/index.ts` | Application entry point |
| `supabase/functions/register-trusted-device/index.ts` | Application entry point |
| `supabase/functions/revoke-trusted-device/index.ts` | Application entry point |
| `supabase/functions/send-2fa-code/index.ts` | Application entry point |
| `supabase/functions/send-invitation/index.ts` | Application entry point |
| `supabase/functions/send-task-reminders/index.ts` | Application entry point |
| `supabase/functions/submit-feedback/index.ts` | Application entry point |
| `supabase/functions/summarize-contract/index.ts` | Application entry point |
| `supabase/functions/summarize-document/index.ts` | Application entry point |
| `supabase/functions/toggle-cron-job/index.ts` | Application entry point |
| `supabase/functions/verify-2fa-code/index.ts` | Application entry point |
| `npm run dev: vite` | Application entry point |

## Configuration Files

| File | Type |
|------|------|
| `.gitignore` | Git |
| `eslint.config.js` | ESLint |
| `tsconfig.json` | TypeScript |



---

*Documentation auto-generated by doc-generator on 2026-03-02.*
