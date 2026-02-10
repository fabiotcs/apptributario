# TypeScript Type Definitions - Accountant Management System

**Document:** TypeScript Interfaces and Types for Story 2.2
**Generated:** February 9, 2026
**File:** `apps/web/src/lib/validation/accountant.ts` + API types

---

## 1. Enum Types

### Specialization Enum

```typescript
type Specialization = 'TAX' | 'PAYROLL' | 'COMPLIANCE' | 'ACCOUNTING' | 'ADVISORY';

/**
 * Professional specialization types
 * - TAX: Income & Corporate Tax services
 * - PAYROLL: Payroll processing and management
 * - COMPLIANCE: Tax compliance and audits
 * - ACCOUNTING: General accounting services
 * - ADVISORY: Business advisory services
 */
```

**Usage:**
```typescript
const specializations: Specialization[] = ['TAX', 'PAYROLL'];
```

### AssignmentRole Enum

```typescript
type AssignmentRole = 'ADVISOR' | 'MANAGER';

/**
 * Role in company assignment
 * - ADVISOR: Read-only advisory access
 * - MANAGER: Full management access
 */
```

### AuditAction Enum

```typescript
type AuditAction = 'ASSIGNED' | 'REMOVED' | 'PROFILE_UPDATED' | 'AVAILABILITY_CHANGED' | 'REASSIGNED';

/**
 * Action types logged in audit trail
 * - ASSIGNED: Accountant assigned to company
 * - REMOVED: Accountant removed from company
 * - PROFILE_UPDATED: Profile information changed
 * - AVAILABILITY_CHANGED: Availability status toggled
 * - REASSIGNED: Role changed in assignment
 */
```

---

## 2. Zod Schema Types

### Certification Type

```typescript
interface Certification {
  name: string;        // Min 1 character
  issuer: string;      // Min 1 character
  expiryDate: string;  // Format: YYYY-MM-DD
}

// Zod Schema
const CertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer name is required'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});
```

### CreateAccountantProfileInput

```typescript
interface CreateAccountantProfileInput {
  // Required fields
  licenseNumber: string;           // 5-50 chars, unique
  specializations: Specialization[]; // Min 1 specialization
  yearsOfExperience: number;       // 0-70 years
  email: string;                   // Valid email format

  // Optional fields
  bio?: string;                    // Max 1000 characters
  hourlyRate?: number;             // In cents (e.g., 20000 = R$200/hr)
  phone?: string;                  // Min 10 chars, digits/spaces/+/-/()
  website?: string;                // Valid URL
  maxClients?: number;             // 1-100 clients
  certifications?: Certification[]; // Array of certifications
  profileImageUrl?: string;        // Valid URL
}

// Example
const newProfile: CreateAccountantProfileInput = {
  licenseNumber: 'CRC/SP-123456',
  specializations: ['TAX', 'PAYROLL'],
  yearsOfExperience: 15,
  email: 'accountant@example.com',
  hourlyRate: 20000,
  maxClients: 25,
  certifications: [
    {
      name: 'CPA',
      issuer: 'AICPA',
      expiryDate: '2026-12-31'
    }
  ]
};
```

### UpdateAccountantProfileInput

```typescript
interface UpdateAccountantProfileInput {
  // All fields optional (partial update)
  bio?: string;
  specializations?: Specialization[];
  yearsOfExperience?: number;
  hourlyRate?: number;
  phone?: string;
  website?: string;
  maxClients?: number;
  certifications?: Certification[];
  profileImageUrl?: string;
}

// Example
const updates: UpdateAccountantProfileInput = {
  hourlyRate: 25000,
  bio: 'Updated professional summary',
};
```

### SearchAccountantsInput

```typescript
interface SearchAccountantsInput {
  // Required
  query: string;  // Search by name, license, email

  // Optional filters
  specializations?: Specialization[];
  minExperience?: number;
  available?: boolean;
  maxHourlyRate?: number;
}

// Example
const searchParams: SearchAccountantsInput = {
  query: 'tax specialist',
  specializations: ['TAX'],
  minExperience: 5,
  available: true,
};
```

---

## 3. API Response Types

### AccountantProfile Type

```typescript
interface AccountantProfile {
  // Identifiers
  id: string;              // UUID
  userId: string;          // FK to User (CONTADOR role)

  // License & Specialization
  licenseNumber: string;   // Unique
  specializations: Specialization[];

  // Professional Info
  bio?: string;
  yearsOfExperience: number;
  hourlyRate?: number;     // In cents
  email: string;

  // Contact
  phone?: string;
  website?: string;

  // Client Management
  isAvailable: boolean;
  maxClients?: number;
  currentClientCount: number;

  // Credentials
  certifications?: Certification[];
  profileImageUrl?: string;

  // Metadata
  createdAt: string;       // ISO 8601 datetime
  updatedAt: string;       // ISO 8601 datetime
}

// Example
const accountant: AccountantProfile = {
  id: 'acc-123',
  userId: 'user-456',
  licenseNumber: 'CRC/SP-123456',
  specializations: ['TAX', 'PAYROLL'],
  bio: 'Expert tax advisor',
  yearsOfExperience: 15,
  hourlyRate: 20000,
  email: 'accountant@example.com',
  phone: '(11) 98765-4321',
  website: 'https://accountant.com',
  isAvailable: true,
  maxClients: 25,
  currentClientCount: 12,
  certifications: [
    { name: 'CPA', issuer: 'AICPA', expiryDate: '2026-12-31' }
  ],
  profileImageUrl: 'https://example.com/photo.jpg',
  createdAt: '2025-02-01T10:00:00Z',
  updatedAt: '2025-02-09T15:30:00Z'
};
```

### CompanyAssignment Type

```typescript
interface CompanyAssignment {
  // Identifiers
  id: string;              // UUID
  accountantId: string;    // FK to AccountantProfile
  companyId: string;       // FK to Company

  // Company Details (included in responses)
  company?: {
    id: string;
    name: string;
    cnpj: string;
  };

  // Assignment Info
  role: AssignmentRole;
  notes?: string;          // Max 500 chars

  // Audit Info
  assignedAt: string;      // ISO 8601 datetime
  assignedBy: string;      // User ID who made assignment
  endedAt?: string;        // Null for active assignments
}

// Example
const assignment: CompanyAssignment = {
  id: 'assign-789',
  accountantId: 'acc-123',
  companyId: 'comp-456',
  company: {
    id: 'comp-456',
    name: 'ABC Corporation',
    cnpj: '12.345.678/0001-90'
  },
  role: 'MANAGER',
  notes: 'Primary tax advisor',
  assignedAt: '2025-02-01T10:00:00Z',
  assignedBy: 'user-789',
  endedAt: null // Active assignment
};
```

### AuditLogEntry Type

```typescript
interface AuditLogEntry {
  id: string;              // UUID
  accountantId: string;    // FK to AccountantProfile
  action: AuditAction;
  companyId?: string;      // Null for profile changes
  performedBy: string;     // FK to User
  changes?: Record<string, {
    before: any;
    after: any;
  }>;
  createdAt: string;       // ISO 8601 datetime
}

// Example
const auditEntry: AuditLogEntry = {
  id: 'audit-123',
  accountantId: 'acc-123',
  action: 'PROFILE_UPDATED',
  companyId: null,
  performedBy: 'user-456',
  changes: {
    'hourlyRate': {
      before: 15000,
      after: 20000
    },
    'bio': {
      before: 'Old bio',
      after: 'New professional summary'
    }
  },
  createdAt: '2025-02-09T15:30:00Z'
};
```

---

## 4. Hook Response Types

### useAccountants Hook

```typescript
interface UseAccountantsResult {
  // State
  loading: boolean;
  error: string | null;

  // Methods
  listAccountants(
    page: number,
    limit: number,
    filters?: {
      search?: string;
      specialization?: Specialization;
      isAvailable?: boolean;
      yearsOfExperience?: number;
    }
  ): Promise<AccountantProfile[]>;

  getAccountantProfile(id: string): Promise<AccountantProfile>;

  createAccountantProfile(
    input: CreateAccountantProfileInput
  ): Promise<AccountantProfile>;

  updateAccountantProfile(
    id: string,
    updates: UpdateAccountantProfileInput
  ): Promise<AccountantProfile>;

  updateAvailability(
    id: string,
    isAvailable: boolean
  ): Promise<AccountantProfile>;

  getAssignedCompanies(id: string): Promise<CompanyAssignment[]>;

  assignAccountantToCompany(
    accountantId: string,
    companyId: string,
    role: AssignmentRole,
    notes?: string
  ): Promise<CompanyAssignment>;

  updateAssignmentRole(
    accountantId: string,
    companyId: string,
    role: AssignmentRole
  ): Promise<CompanyAssignment>;

  removeAssignment(
    accountantId: string,
    companyId: string
  ): Promise<{ success: boolean; message: string }>;

  getAuditLog(id: string): Promise<AuditLogEntry[]>;

  searchAccountants(
    input: SearchAccountantsInput
  ): Promise<AccountantProfile[]>;
}

// Usage
const { listAccountants, loading, error } = useAccountants();
const accountants = await listAccountants(1, 20);
```

---

## 5. Component Props Types

### AccountantCard Props

```typescript
interface AccountantCardProps {
  id: string;
  name?: string;
  licenseNumber: string;
  specializations: Specialization[];
  yearsOfExperience: number;
  hourlyRate?: number;
  isAvailable: boolean;
  maxClients?: number;
  currentClientCount: number;
  certifications?: Certification[];
}
```

### AccountantForm Props

```typescript
interface AccountantFormProps {
  initialData?: Partial<CreateAccountantProfileInput>;
  isEdit?: boolean;
  onSubmit: (data: CreateAccountantProfileInput | UpdateAccountantProfileInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
```

### SpecializationTag Props

```typescript
interface SpecializationTagProps {
  specialization: Specialization;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
}
```

### CertificationList Props

```typescript
interface CertificationListProps {
  certifications: Certification[];
  showStatus?: boolean;
}
```

### AssignmentCard Props

```typescript
interface AssignmentCardProps {
  accountantId: string;
  company: {
    id: string;
    name: string;
    cnpj: string;
  };
  role: AssignmentRole;
  notes?: string;
  assignedAt: string;
  assignedBy: string;
  onRemove?: (accountantId: string, companyId: string) => void;
  onUpdateRole?: (accountantId: string, companyId: string, newRole: AssignmentRole) => void;
  isLoading?: boolean;
}
```

### AccountantFilter Props

```typescript
interface AccountantFilterProps {
  onFilterChange?: (filters: {
    search?: string;
    specialization?: Specialization;
    isAvailable?: boolean;
    yearsOfExperience?: number;
  }) => void;
  isLoading?: boolean;
}
```

---

## 6. Helper Function Types

### Specialization Mappings

```typescript
// Label mapping
const SpecializationLabels: Record<Specialization, string> = {
  TAX: 'Income & Corporate Tax',
  PAYROLL: 'Payroll Management',
  COMPLIANCE: 'Tax Compliance',
  ACCOUNTING: 'Accounting Services',
  ADVISORY: 'Business Advisory',
};

// Color mapping
const SpecializationColors: Record<Specialization, string> = {
  TAX: 'bg-blue-100 text-blue-800',
  PAYROLL: 'bg-green-100 text-green-800',
  COMPLIANCE: 'bg-purple-100 text-purple-800',
  ACCOUNTING: 'bg-orange-100 text-orange-800',
  ADVISORY: 'bg-pink-100 text-pink-800',
};
```

### Helper Function Types

```typescript
// License validation
function validateLicenseNumber(license: string): boolean;

// Experience badge formatting
function getExperienceBadge(years: number): string;
// Returns: 'Beginner', '1+ year', '5+ years', '10+ years', '20+ years'

// Hourly rate formatting
function formatHourlyRate(cents: number | undefined): string;
// Returns: 'R$ 200,00' or 'Not specified'

// Availability badge
function getAvailabilityBadge(isAvailable: boolean): {
  color: string;
  label: string;
};

// Capacity calculation
function getCapacityPercentage(current: number, max: number): number;

// Capacity color
function getCapacityColor(percentage: number): string;
// Returns: 'bg-green-500', 'bg-yellow-500', 'bg-red-500'
```

---

## 7. API Response Wrappers

### Successful Response

```typescript
interface SuccessResponse<T> {
  success: true;
  [key: string]: T | boolean; // Dynamic keys like 'profile', 'assignments'
}

// Examples
type ProfileResponse = SuccessResponse<AccountantProfile>;
type AssignmentsResponse = SuccessResponse<CompanyAssignment[]>;
type AuditLogResponse = SuccessResponse<AuditLogEntry[]>;
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  message: string;
}
```

### Paginated List Response

```typescript
interface PaginatedResponse {
  success: true;
  accountants: AccountantProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
```

---

## 8. TypeScript Usage Examples

### Creating an Accountant Profile

```typescript
import { CreateAccountantProfileInput, Specialization } from '@/lib/validation/accountant';
import { useAccountants } from '@/hooks/useAccountants';

export function CreateAccountantExample() {
  const { createAccountantProfile } = useAccountants();

  const handleCreate = async () => {
    const input: CreateAccountantProfileInput = {
      licenseNumber: 'CRC/SP-001234',
      specializations: ['TAX', 'COMPLIANCE'],
      yearsOfExperience: 12,
      email: 'joao@example.com',
      hourlyRate: 20000,
      maxClients: 25,
    };

    try {
      const profile = await createAccountantProfile(input);
      console.log('Created:', profile.id);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

### Filtering Accountants

```typescript
import { Specialization } from '@/lib/validation/accountant';
import { useAccountants } from '@/hooks/useAccountants';

export function FilterAccountantsExample() {
  const { listAccountants } = useAccountants();

  const handleFilter = async (spec: Specialization) => {
    const results = await listAccountants(1, 20, {
      specialization: spec,
      isAvailable: true,
      yearsOfExperience: 5,
    });

    console.log(`Found ${results.length} available ${spec} accountants`);
  };

  return (
    <button onClick={() => handleFilter('TAX')}>
      Find Tax Specialists
    </button>
  );
}
```

### Assigning to Company

```typescript
import { AssignmentRole } from '@/lib/validation/accountant';
import { useAccountants } from '@/hooks/useAccountants';

export function AssignmentExample() {
  const { assignAccountantToCompany } = useAccountants();

  const handleAssign = async (accountantId: string, companyId: string) => {
    try {
      const assignment = await assignAccountantToCompany(
        accountantId,
        companyId,
        'MANAGER' as AssignmentRole,
        'Primary tax advisor'
      );

      console.log('Assigned:', assignment.id);
    } catch (error) {
      console.error('Assignment failed:', error);
    }
  };

  return (
    <button onClick={() => handleAssign('acc-123', 'comp-456')}>
      Assign
    </button>
  );
}
```

---

## 9. Type Safety Best Practices

### ✅ DO: Use Zod Validation

```typescript
// Good - validated data
const result = createAccountantProfileSchema.safeParse(data);
if (result.success) {
  const validated: CreateAccountantProfileInput = result.data;
  // Type-safe operations
}
```

### ✅ DO: Use Enums for Specializations

```typescript
// Good - type-safe specialization
const specs: Specialization[] = ['TAX', 'PAYROLL'];
specs.forEach(spec => {
  console.log(SpecializationLabels[spec]);
});
```

### ❌ DON'T: String Specializations

```typescript
// Bad - not type-safe
const specs = ['TAX', 'UNKNOWN_SPEC'];
```

### ✅ DO: Type Hook Results

```typescript
// Good - explicit typing
const profile: AccountantProfile = await getAccountantProfile(id);
```

### ❌ DON'T: Use Any Type

```typescript
// Bad - loses type safety
const profile: any = await getAccountantProfile(id);
```

---

## 10. Database Schema Mapping

### Prisma to TypeScript Mapping

| Prisma Model | TypeScript Type | Notes |
|--------------|-----------------|-------|
| AccountantProfile | AccountantProfile interface | Complete 1:1 mapping |
| CompanyAccountant | CompanyAssignment interface | Excludes internal relations |
| AccountantAuditLog | AuditLogEntry interface | Includes all fields |
| User (role: CONTADOR) | Via userId FK | Related via userId |

### Zod to Database Mapping

| Zod Schema | Database Table | Validation |
|------------|----------------|-----------|
| createAccountantProfileSchema | AccountantProfile | Input validation |
| updateAccountantProfileSchema | AccountantProfile | Partial updates |
| searchAccountantsSchema | Query builder | Search parameters |
| CertificationSchema | JSON array | Nested validation |

---

## Summary

**Total Type Definitions:** 15+
- 3 Enum types
- 5 Interface types
- 4 Schema types
- 3 Utility types
- 8+ Helper function signatures

**All types are exported from:** `apps/web/src/lib/validation/accountant.ts`

**Usage:** Import types and schemas for type-safe development throughout the application.
