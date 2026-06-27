import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Attrition, AttritionInput, AuditLogEntry, AuthUser, Benchmarking, BusinessUnit, ComparisonRow, Employee, EmployeeInput, EmployeeUpdate, ErCase, ErCaseInput, ErCaseUpdate, Error, ExecutiveInsight, GetDashboardKpisParams, GetDashboardTrendsParams, GetIntelligenceContextParams, GetIntelligenceHealthScoresParams, GetIntelligenceInsightsParams, GetIntelligenceRiskParams, HealthScore, HealthStatus, Kpis, ListAttritionParams, ListAuditLogParams, ListEmployeesParams, ListErCasesParams, ListProbationParams, ListRequisitionsParams, LoginInput, Notification, Persona, Probation, ProbationInput, ProbationUpdate, Requisition, RequisitionInput, RequisitionUpdate, RiskProfile, TrendPoint, User, UserInput, UserUpdate, WorkforceContext } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPersonasUrl: () => string;
/**
 * @summary List available dev login personas
 */
export declare const listPersonas: (options?: RequestInit) => Promise<Persona[]>;
export declare const getListPersonasQueryKey: () => readonly ["/api/auth/personas"];
export declare const getListPersonasQueryOptions: <TData = Awaited<ReturnType<typeof listPersonas>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPersonas>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPersonas>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPersonasQueryResult = NonNullable<Awaited<ReturnType<typeof listPersonas>>>;
export type ListPersonasQueryError = ErrorType<unknown>;
/**
 * @summary List available dev login personas
 */
export declare function useListPersonas<TData = Awaited<ReturnType<typeof listPersonas>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPersonas>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginUrl: () => string;
/**
 * @summary Log in as a dev persona
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthUser>;
export declare const getLoginMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<Error>;
/**
* @summary Log in as a dev persona
*/
export declare const useLogin: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Log out
 */
export declare const logout: (options?: RequestInit) => Promise<void>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Log out
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetCurrentUserUrl: () => string;
/**
 * @summary Get the current authenticated user
 */
export declare const getCurrentUser: (options?: RequestInit) => Promise<AuthUser>;
export declare const getGetCurrentUserQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetCurrentUserQueryOptions: <TData = Awaited<ReturnType<typeof getCurrentUser>>, TError = ErrorType<Error>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCurrentUserQueryResult = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export type GetCurrentUserQueryError = ErrorType<Error>;
/**
 * @summary Get the current authenticated user
 */
export declare function useGetCurrentUser<TData = Awaited<ReturnType<typeof getCurrentUser>>, TError = ErrorType<Error>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListBusinessUnitsUrl: () => string;
/**
 * @summary List business units in scope
 */
export declare const listBusinessUnits: (options?: RequestInit) => Promise<BusinessUnit[]>;
export declare const getListBusinessUnitsQueryKey: () => readonly ["/api/business-units"];
export declare const getListBusinessUnitsQueryOptions: <TData = Awaited<ReturnType<typeof listBusinessUnits>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBusinessUnits>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listBusinessUnits>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListBusinessUnitsQueryResult = NonNullable<Awaited<ReturnType<typeof listBusinessUnits>>>;
export type ListBusinessUnitsQueryError = ErrorType<unknown>;
/**
 * @summary List business units in scope
 */
export declare function useListBusinessUnits<TData = Awaited<ReturnType<typeof listBusinessUnits>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBusinessUnits>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListEmployeesUrl: (params?: ListEmployeesParams) => string;
/**
 * @summary List employees in scope
 */
export declare const listEmployees: (params?: ListEmployeesParams, options?: RequestInit) => Promise<Employee[]>;
export declare const getListEmployeesQueryKey: (params?: ListEmployeesParams) => readonly ["/api/employees", ...ListEmployeesParams[]];
export declare const getListEmployeesQueryOptions: <TData = Awaited<ReturnType<typeof listEmployees>>, TError = ErrorType<unknown>>(params?: ListEmployeesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEmployees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listEmployees>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListEmployeesQueryResult = NonNullable<Awaited<ReturnType<typeof listEmployees>>>;
export type ListEmployeesQueryError = ErrorType<unknown>;
/**
 * @summary List employees in scope
 */
export declare function useListEmployees<TData = Awaited<ReturnType<typeof listEmployees>>, TError = ErrorType<unknown>>(params?: ListEmployeesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEmployees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEmployeeUrl: () => string;
/**
 * @summary Create an employee
 */
export declare const createEmployee: (employeeInput: EmployeeInput, options?: RequestInit) => Promise<Employee>;
export declare const getCreateEmployeeMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
        data: BodyType<EmployeeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
    data: BodyType<EmployeeInput>;
}, TContext>;
export type CreateEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof createEmployee>>>;
export type CreateEmployeeMutationBody = BodyType<EmployeeInput>;
export type CreateEmployeeMutationError = ErrorType<Error>;
/**
* @summary Create an employee
*/
export declare const useCreateEmployee: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
        data: BodyType<EmployeeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEmployee>>, TError, {
    data: BodyType<EmployeeInput>;
}, TContext>;
export declare const getGetEmployeeUrl: (id: number) => string;
/**
 * @summary Get an employee
 */
export declare const getEmployee: (id: number, options?: RequestInit) => Promise<Employee>;
export declare const getGetEmployeeQueryKey: (id: number) => readonly [`/api/employees/${number}`];
export declare const getGetEmployeeQueryOptions: <TData = Awaited<ReturnType<typeof getEmployee>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEmployeeQueryResult = NonNullable<Awaited<ReturnType<typeof getEmployee>>>;
export type GetEmployeeQueryError = ErrorType<Error>;
/**
 * @summary Get an employee
 */
export declare function useGetEmployee<TData = Awaited<ReturnType<typeof getEmployee>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateEmployeeUrl: (id: number) => string;
/**
 * @summary Update an employee
 */
export declare const updateEmployee: (id: number, employeeUpdate: EmployeeUpdate, options?: RequestInit) => Promise<Employee>;
export declare const getUpdateEmployeeMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
        id: number;
        data: BodyType<EmployeeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
    id: number;
    data: BodyType<EmployeeUpdate>;
}, TContext>;
export type UpdateEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof updateEmployee>>>;
export type UpdateEmployeeMutationBody = BodyType<EmployeeUpdate>;
export type UpdateEmployeeMutationError = ErrorType<Error>;
/**
* @summary Update an employee
*/
export declare const useUpdateEmployee: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
        id: number;
        data: BodyType<EmployeeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateEmployee>>, TError, {
    id: number;
    data: BodyType<EmployeeUpdate>;
}, TContext>;
export declare const getDeleteEmployeeUrl: (id: number) => string;
/**
 * @summary Delete an employee
 */
export declare const deleteEmployee: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteEmployeeMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
    id: number;
}, TContext>;
export type DeleteEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEmployee>>>;
export type DeleteEmployeeMutationError = ErrorType<Error>;
/**
* @summary Delete an employee
*/
export declare const useDeleteEmployee: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
    id: number;
}, TContext>;
export declare const getListRequisitionsUrl: (params?: ListRequisitionsParams) => string;
/**
 * @summary List requisitions in scope
 */
export declare const listRequisitions: (params?: ListRequisitionsParams, options?: RequestInit) => Promise<Requisition[]>;
export declare const getListRequisitionsQueryKey: (params?: ListRequisitionsParams) => readonly ["/api/requisitions", ...ListRequisitionsParams[]];
export declare const getListRequisitionsQueryOptions: <TData = Awaited<ReturnType<typeof listRequisitions>>, TError = ErrorType<unknown>>(params?: ListRequisitionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRequisitions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRequisitions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRequisitionsQueryResult = NonNullable<Awaited<ReturnType<typeof listRequisitions>>>;
export type ListRequisitionsQueryError = ErrorType<unknown>;
/**
 * @summary List requisitions in scope
 */
export declare function useListRequisitions<TData = Awaited<ReturnType<typeof listRequisitions>>, TError = ErrorType<unknown>>(params?: ListRequisitionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRequisitions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateRequisitionUrl: () => string;
/**
 * @summary Create a requisition
 */
export declare const createRequisition: (requisitionInput: RequisitionInput, options?: RequestInit) => Promise<Requisition>;
export declare const getCreateRequisitionMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRequisition>>, TError, {
        data: BodyType<RequisitionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRequisition>>, TError, {
    data: BodyType<RequisitionInput>;
}, TContext>;
export type CreateRequisitionMutationResult = NonNullable<Awaited<ReturnType<typeof createRequisition>>>;
export type CreateRequisitionMutationBody = BodyType<RequisitionInput>;
export type CreateRequisitionMutationError = ErrorType<Error>;
/**
* @summary Create a requisition
*/
export declare const useCreateRequisition: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRequisition>>, TError, {
        data: BodyType<RequisitionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRequisition>>, TError, {
    data: BodyType<RequisitionInput>;
}, TContext>;
export declare const getGetRequisitionUrl: (id: number) => string;
/**
 * @summary Get a requisition
 */
export declare const getRequisition: (id: number, options?: RequestInit) => Promise<Requisition>;
export declare const getGetRequisitionQueryKey: (id: number) => readonly [`/api/requisitions/${number}`];
export declare const getGetRequisitionQueryOptions: <TData = Awaited<ReturnType<typeof getRequisition>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequisition>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRequisition>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRequisitionQueryResult = NonNullable<Awaited<ReturnType<typeof getRequisition>>>;
export type GetRequisitionQueryError = ErrorType<Error>;
/**
 * @summary Get a requisition
 */
export declare function useGetRequisition<TData = Awaited<ReturnType<typeof getRequisition>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequisition>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateRequisitionUrl: (id: number) => string;
/**
 * @summary Update a requisition
 */
export declare const updateRequisition: (id: number, requisitionUpdate: RequisitionUpdate, options?: RequestInit) => Promise<Requisition>;
export declare const getUpdateRequisitionMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateRequisition>>, TError, {
        id: number;
        data: BodyType<RequisitionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateRequisition>>, TError, {
    id: number;
    data: BodyType<RequisitionUpdate>;
}, TContext>;
export type UpdateRequisitionMutationResult = NonNullable<Awaited<ReturnType<typeof updateRequisition>>>;
export type UpdateRequisitionMutationBody = BodyType<RequisitionUpdate>;
export type UpdateRequisitionMutationError = ErrorType<Error>;
/**
* @summary Update a requisition
*/
export declare const useUpdateRequisition: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateRequisition>>, TError, {
        id: number;
        data: BodyType<RequisitionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateRequisition>>, TError, {
    id: number;
    data: BodyType<RequisitionUpdate>;
}, TContext>;
export declare const getDeleteRequisitionUrl: (id: number) => string;
/**
 * @summary Delete a requisition
 */
export declare const deleteRequisition: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteRequisitionMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteRequisition>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteRequisition>>, TError, {
    id: number;
}, TContext>;
export type DeleteRequisitionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteRequisition>>>;
export type DeleteRequisitionMutationError = ErrorType<Error>;
/**
* @summary Delete a requisition
*/
export declare const useDeleteRequisition: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteRequisition>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteRequisition>>, TError, {
    id: number;
}, TContext>;
export declare const getListErCasesUrl: (params?: ListErCasesParams) => string;
/**
 * @summary List ER cases in scope
 */
export declare const listErCases: (params?: ListErCasesParams, options?: RequestInit) => Promise<ErCase[]>;
export declare const getListErCasesQueryKey: (params?: ListErCasesParams) => readonly ["/api/er-cases", ...ListErCasesParams[]];
export declare const getListErCasesQueryOptions: <TData = Awaited<ReturnType<typeof listErCases>>, TError = ErrorType<unknown>>(params?: ListErCasesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listErCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listErCases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListErCasesQueryResult = NonNullable<Awaited<ReturnType<typeof listErCases>>>;
export type ListErCasesQueryError = ErrorType<unknown>;
/**
 * @summary List ER cases in scope
 */
export declare function useListErCases<TData = Awaited<ReturnType<typeof listErCases>>, TError = ErrorType<unknown>>(params?: ListErCasesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listErCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateErCaseUrl: () => string;
/**
 * @summary Create an ER case
 */
export declare const createErCase: (erCaseInput: ErCaseInput, options?: RequestInit) => Promise<ErCase>;
export declare const getCreateErCaseMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createErCase>>, TError, {
        data: BodyType<ErCaseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createErCase>>, TError, {
    data: BodyType<ErCaseInput>;
}, TContext>;
export type CreateErCaseMutationResult = NonNullable<Awaited<ReturnType<typeof createErCase>>>;
export type CreateErCaseMutationBody = BodyType<ErCaseInput>;
export type CreateErCaseMutationError = ErrorType<Error>;
/**
* @summary Create an ER case
*/
export declare const useCreateErCase: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createErCase>>, TError, {
        data: BodyType<ErCaseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createErCase>>, TError, {
    data: BodyType<ErCaseInput>;
}, TContext>;
export declare const getGetErCaseUrl: (id: number) => string;
/**
 * @summary Get an ER case
 */
export declare const getErCase: (id: number, options?: RequestInit) => Promise<ErCase>;
export declare const getGetErCaseQueryKey: (id: number) => readonly [`/api/er-cases/${number}`];
export declare const getGetErCaseQueryOptions: <TData = Awaited<ReturnType<typeof getErCase>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getErCase>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getErCase>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetErCaseQueryResult = NonNullable<Awaited<ReturnType<typeof getErCase>>>;
export type GetErCaseQueryError = ErrorType<Error>;
/**
 * @summary Get an ER case
 */
export declare function useGetErCase<TData = Awaited<ReturnType<typeof getErCase>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getErCase>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateErCaseUrl: (id: number) => string;
/**
 * @summary Update an ER case
 */
export declare const updateErCase: (id: number, erCaseUpdate: ErCaseUpdate, options?: RequestInit) => Promise<ErCase>;
export declare const getUpdateErCaseMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateErCase>>, TError, {
        id: number;
        data: BodyType<ErCaseUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateErCase>>, TError, {
    id: number;
    data: BodyType<ErCaseUpdate>;
}, TContext>;
export type UpdateErCaseMutationResult = NonNullable<Awaited<ReturnType<typeof updateErCase>>>;
export type UpdateErCaseMutationBody = BodyType<ErCaseUpdate>;
export type UpdateErCaseMutationError = ErrorType<Error>;
/**
* @summary Update an ER case
*/
export declare const useUpdateErCase: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateErCase>>, TError, {
        id: number;
        data: BodyType<ErCaseUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateErCase>>, TError, {
    id: number;
    data: BodyType<ErCaseUpdate>;
}, TContext>;
export declare const getDeleteErCaseUrl: (id: number) => string;
/**
 * @summary Delete an ER case
 */
export declare const deleteErCase: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteErCaseMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteErCase>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteErCase>>, TError, {
    id: number;
}, TContext>;
export type DeleteErCaseMutationResult = NonNullable<Awaited<ReturnType<typeof deleteErCase>>>;
export type DeleteErCaseMutationError = ErrorType<Error>;
/**
* @summary Delete an ER case
*/
export declare const useDeleteErCase: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteErCase>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteErCase>>, TError, {
    id: number;
}, TContext>;
export declare const getListAttritionUrl: (params?: ListAttritionParams) => string;
/**
 * @summary List attrition records in scope
 */
export declare const listAttrition: (params?: ListAttritionParams, options?: RequestInit) => Promise<Attrition[]>;
export declare const getListAttritionQueryKey: (params?: ListAttritionParams) => readonly ["/api/attrition", ...ListAttritionParams[]];
export declare const getListAttritionQueryOptions: <TData = Awaited<ReturnType<typeof listAttrition>>, TError = ErrorType<unknown>>(params?: ListAttritionParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAttrition>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAttrition>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAttritionQueryResult = NonNullable<Awaited<ReturnType<typeof listAttrition>>>;
export type ListAttritionQueryError = ErrorType<unknown>;
/**
 * @summary List attrition records in scope
 */
export declare function useListAttrition<TData = Awaited<ReturnType<typeof listAttrition>>, TError = ErrorType<unknown>>(params?: ListAttritionParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAttrition>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAttritionUrl: () => string;
/**
 * @summary Create an attrition record
 */
export declare const createAttrition: (attritionInput: AttritionInput, options?: RequestInit) => Promise<Attrition>;
export declare const getCreateAttritionMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAttrition>>, TError, {
        data: BodyType<AttritionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAttrition>>, TError, {
    data: BodyType<AttritionInput>;
}, TContext>;
export type CreateAttritionMutationResult = NonNullable<Awaited<ReturnType<typeof createAttrition>>>;
export type CreateAttritionMutationBody = BodyType<AttritionInput>;
export type CreateAttritionMutationError = ErrorType<Error>;
/**
* @summary Create an attrition record
*/
export declare const useCreateAttrition: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAttrition>>, TError, {
        data: BodyType<AttritionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAttrition>>, TError, {
    data: BodyType<AttritionInput>;
}, TContext>;
export declare const getGetAttritionUrl: (id: number) => string;
/**
 * @summary Get an attrition record
 */
export declare const getAttrition: (id: number, options?: RequestInit) => Promise<Attrition>;
export declare const getGetAttritionQueryKey: (id: number) => readonly [`/api/attrition/${number}`];
export declare const getGetAttritionQueryOptions: <TData = Awaited<ReturnType<typeof getAttrition>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAttrition>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAttrition>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAttritionQueryResult = NonNullable<Awaited<ReturnType<typeof getAttrition>>>;
export type GetAttritionQueryError = ErrorType<Error>;
/**
 * @summary Get an attrition record
 */
export declare function useGetAttrition<TData = Awaited<ReturnType<typeof getAttrition>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAttrition>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getDeleteAttritionUrl: (id: number) => string;
/**
 * @summary Delete an attrition record
 */
export declare const deleteAttrition: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteAttritionMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAttrition>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAttrition>>, TError, {
    id: number;
}, TContext>;
export type DeleteAttritionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAttrition>>>;
export type DeleteAttritionMutationError = ErrorType<Error>;
/**
* @summary Delete an attrition record
*/
export declare const useDeleteAttrition: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAttrition>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAttrition>>, TError, {
    id: number;
}, TContext>;
export declare const getListProbationUrl: (params?: ListProbationParams) => string;
/**
 * @summary List probation records in scope
 */
export declare const listProbation: (params?: ListProbationParams, options?: RequestInit) => Promise<Probation[]>;
export declare const getListProbationQueryKey: (params?: ListProbationParams) => readonly ["/api/probation", ...ListProbationParams[]];
export declare const getListProbationQueryOptions: <TData = Awaited<ReturnType<typeof listProbation>>, TError = ErrorType<unknown>>(params?: ListProbationParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProbation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProbation>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProbationQueryResult = NonNullable<Awaited<ReturnType<typeof listProbation>>>;
export type ListProbationQueryError = ErrorType<unknown>;
/**
 * @summary List probation records in scope
 */
export declare function useListProbation<TData = Awaited<ReturnType<typeof listProbation>>, TError = ErrorType<unknown>>(params?: ListProbationParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProbation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProbationUrl: () => string;
/**
 * @summary Create a probation record
 */
export declare const createProbation: (probationInput: ProbationInput, options?: RequestInit) => Promise<Probation>;
export declare const getCreateProbationMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProbation>>, TError, {
        data: BodyType<ProbationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProbation>>, TError, {
    data: BodyType<ProbationInput>;
}, TContext>;
export type CreateProbationMutationResult = NonNullable<Awaited<ReturnType<typeof createProbation>>>;
export type CreateProbationMutationBody = BodyType<ProbationInput>;
export type CreateProbationMutationError = ErrorType<Error>;
/**
* @summary Create a probation record
*/
export declare const useCreateProbation: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProbation>>, TError, {
        data: BodyType<ProbationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProbation>>, TError, {
    data: BodyType<ProbationInput>;
}, TContext>;
export declare const getGetProbationUrl: (id: number) => string;
/**
 * @summary Get a probation record
 */
export declare const getProbation: (id: number, options?: RequestInit) => Promise<Probation>;
export declare const getGetProbationQueryKey: (id: number) => readonly [`/api/probation/${number}`];
export declare const getGetProbationQueryOptions: <TData = Awaited<ReturnType<typeof getProbation>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProbation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProbation>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProbationQueryResult = NonNullable<Awaited<ReturnType<typeof getProbation>>>;
export type GetProbationQueryError = ErrorType<Error>;
/**
 * @summary Get a probation record
 */
export declare function useGetProbation<TData = Awaited<ReturnType<typeof getProbation>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProbation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProbationUrl: (id: number) => string;
/**
 * @summary Update a probation record
 */
export declare const updateProbation: (id: number, probationUpdate: ProbationUpdate, options?: RequestInit) => Promise<Probation>;
export declare const getUpdateProbationMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProbation>>, TError, {
        id: number;
        data: BodyType<ProbationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProbation>>, TError, {
    id: number;
    data: BodyType<ProbationUpdate>;
}, TContext>;
export type UpdateProbationMutationResult = NonNullable<Awaited<ReturnType<typeof updateProbation>>>;
export type UpdateProbationMutationBody = BodyType<ProbationUpdate>;
export type UpdateProbationMutationError = ErrorType<Error>;
/**
* @summary Update a probation record
*/
export declare const useUpdateProbation: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProbation>>, TError, {
        id: number;
        data: BodyType<ProbationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProbation>>, TError, {
    id: number;
    data: BodyType<ProbationUpdate>;
}, TContext>;
export declare const getDeleteProbationUrl: (id: number) => string;
/**
 * @summary Delete a probation record
 */
export declare const deleteProbation: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteProbationMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProbation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProbation>>, TError, {
    id: number;
}, TContext>;
export type DeleteProbationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProbation>>>;
export type DeleteProbationMutationError = ErrorType<Error>;
/**
* @summary Delete a probation record
*/
export declare const useDeleteProbation: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProbation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProbation>>, TError, {
    id: number;
}, TContext>;
export declare const getGetDashboardKpisUrl: (params?: GetDashboardKpisParams) => string;
/**
 * @summary Get scope-aware KPIs
 */
export declare const getDashboardKpis: (params?: GetDashboardKpisParams, options?: RequestInit) => Promise<Kpis>;
export declare const getGetDashboardKpisQueryKey: (params?: GetDashboardKpisParams) => readonly ["/api/dashboard/kpis", ...GetDashboardKpisParams[]];
export declare const getGetDashboardKpisQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardKpis>>, TError = ErrorType<unknown>>(params?: GetDashboardKpisParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardKpis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardKpis>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardKpisQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardKpis>>>;
export type GetDashboardKpisQueryError = ErrorType<unknown>;
/**
 * @summary Get scope-aware KPIs
 */
export declare function useGetDashboardKpis<TData = Awaited<ReturnType<typeof getDashboardKpis>>, TError = ErrorType<unknown>>(params?: GetDashboardKpisParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardKpis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardComparisonUrl: () => string;
/**
 * @summary Compare KPIs across business units (CHRO/Director/Admin)
 */
export declare const getDashboardComparison: (options?: RequestInit) => Promise<ComparisonRow[]>;
export declare const getGetDashboardComparisonQueryKey: () => readonly ["/api/dashboard/comparison"];
export declare const getGetDashboardComparisonQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardComparison>>, TError = ErrorType<Error>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardComparison>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardComparison>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardComparisonQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardComparison>>>;
export type GetDashboardComparisonQueryError = ErrorType<Error>;
/**
 * @summary Compare KPIs across business units (CHRO/Director/Admin)
 */
export declare function useGetDashboardComparison<TData = Awaited<ReturnType<typeof getDashboardComparison>>, TError = ErrorType<Error>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardComparison>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardTrendsUrl: (params?: GetDashboardTrendsParams) => string;
/**
 * @summary Get monthly headcount and attrition trend
 */
export declare const getDashboardTrends: (params?: GetDashboardTrendsParams, options?: RequestInit) => Promise<TrendPoint[]>;
export declare const getGetDashboardTrendsQueryKey: (params?: GetDashboardTrendsParams) => readonly ["/api/dashboard/trends", ...GetDashboardTrendsParams[]];
export declare const getGetDashboardTrendsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardTrends>>, TError = ErrorType<unknown>>(params?: GetDashboardTrendsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardTrends>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardTrends>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardTrendsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardTrends>>>;
export type GetDashboardTrendsQueryError = ErrorType<unknown>;
/**
 * @summary Get monthly headcount and attrition trend
 */
export declare function useGetDashboardTrends<TData = Awaited<ReturnType<typeof getDashboardTrends>>, TError = ErrorType<unknown>>(params?: GetDashboardTrendsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardTrends>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetIntelligenceHealthScoresUrl: (params?: GetIntelligenceHealthScoresParams) => string;
/**
 * @summary Business-unit health scores (scope-aware)
 */
export declare const getIntelligenceHealthScores: (params?: GetIntelligenceHealthScoresParams, options?: RequestInit) => Promise<HealthScore[]>;
export declare const getGetIntelligenceHealthScoresQueryKey: (params?: GetIntelligenceHealthScoresParams) => readonly ["/api/intelligence/health-scores", ...GetIntelligenceHealthScoresParams[]];
export declare const getGetIntelligenceHealthScoresQueryOptions: <TData = Awaited<ReturnType<typeof getIntelligenceHealthScores>>, TError = ErrorType<unknown>>(params?: GetIntelligenceHealthScoresParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceHealthScores>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceHealthScores>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIntelligenceHealthScoresQueryResult = NonNullable<Awaited<ReturnType<typeof getIntelligenceHealthScores>>>;
export type GetIntelligenceHealthScoresQueryError = ErrorType<unknown>;
/**
 * @summary Business-unit health scores (scope-aware)
 */
export declare function useGetIntelligenceHealthScores<TData = Awaited<ReturnType<typeof getIntelligenceHealthScores>>, TError = ErrorType<unknown>>(params?: GetIntelligenceHealthScoresParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceHealthScores>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetIntelligenceRiskUrl: (params?: GetIntelligenceRiskParams) => string;
/**
 * @summary Business-unit workforce risk profiles (scope-aware)
 */
export declare const getIntelligenceRisk: (params?: GetIntelligenceRiskParams, options?: RequestInit) => Promise<RiskProfile[]>;
export declare const getGetIntelligenceRiskQueryKey: (params?: GetIntelligenceRiskParams) => readonly ["/api/intelligence/risk", ...GetIntelligenceRiskParams[]];
export declare const getGetIntelligenceRiskQueryOptions: <TData = Awaited<ReturnType<typeof getIntelligenceRisk>>, TError = ErrorType<unknown>>(params?: GetIntelligenceRiskParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceRisk>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceRisk>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIntelligenceRiskQueryResult = NonNullable<Awaited<ReturnType<typeof getIntelligenceRisk>>>;
export type GetIntelligenceRiskQueryError = ErrorType<unknown>;
/**
 * @summary Business-unit workforce risk profiles (scope-aware)
 */
export declare function useGetIntelligenceRisk<TData = Awaited<ReturnType<typeof getIntelligenceRisk>>, TError = ErrorType<unknown>>(params?: GetIntelligenceRiskParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceRisk>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetIntelligenceBenchmarkingUrl: () => string;
/**
 * @summary Cross-business-unit benchmarking (CHRO/Director/Admin)
 */
export declare const getIntelligenceBenchmarking: (options?: RequestInit) => Promise<Benchmarking>;
export declare const getGetIntelligenceBenchmarkingQueryKey: () => readonly ["/api/intelligence/benchmarking"];
export declare const getGetIntelligenceBenchmarkingQueryOptions: <TData = Awaited<ReturnType<typeof getIntelligenceBenchmarking>>, TError = ErrorType<Error>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceBenchmarking>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceBenchmarking>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIntelligenceBenchmarkingQueryResult = NonNullable<Awaited<ReturnType<typeof getIntelligenceBenchmarking>>>;
export type GetIntelligenceBenchmarkingQueryError = ErrorType<Error>;
/**
 * @summary Cross-business-unit benchmarking (CHRO/Director/Admin)
 */
export declare function useGetIntelligenceBenchmarking<TData = Awaited<ReturnType<typeof getIntelligenceBenchmarking>>, TError = ErrorType<Error>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceBenchmarking>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetIntelligenceInsightsUrl: (params?: GetIntelligenceInsightsParams) => string;
/**
 * @summary Executive insights with recommended actions (scope-aware)
 */
export declare const getIntelligenceInsights: (params?: GetIntelligenceInsightsParams, options?: RequestInit) => Promise<ExecutiveInsight[]>;
export declare const getGetIntelligenceInsightsQueryKey: (params?: GetIntelligenceInsightsParams) => readonly ["/api/intelligence/insights", ...GetIntelligenceInsightsParams[]];
export declare const getGetIntelligenceInsightsQueryOptions: <TData = Awaited<ReturnType<typeof getIntelligenceInsights>>, TError = ErrorType<unknown>>(params?: GetIntelligenceInsightsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceInsights>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceInsights>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIntelligenceInsightsQueryResult = NonNullable<Awaited<ReturnType<typeof getIntelligenceInsights>>>;
export type GetIntelligenceInsightsQueryError = ErrorType<unknown>;
/**
 * @summary Executive insights with recommended actions (scope-aware)
 */
export declare function useGetIntelligenceInsights<TData = Awaited<ReturnType<typeof getIntelligenceInsights>>, TError = ErrorType<unknown>>(params?: GetIntelligenceInsightsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceInsights>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetIntelligenceContextUrl: (params?: GetIntelligenceContextParams) => string;
/**
 * @summary Full workforce context data points (for future AI consumers)
 */
export declare const getIntelligenceContext: (params?: GetIntelligenceContextParams, options?: RequestInit) => Promise<WorkforceContext>;
export declare const getGetIntelligenceContextQueryKey: (params?: GetIntelligenceContextParams) => readonly ["/api/intelligence/context", ...GetIntelligenceContextParams[]];
export declare const getGetIntelligenceContextQueryOptions: <TData = Awaited<ReturnType<typeof getIntelligenceContext>>, TError = ErrorType<unknown>>(params?: GetIntelligenceContextParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceContext>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceContext>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIntelligenceContextQueryResult = NonNullable<Awaited<ReturnType<typeof getIntelligenceContext>>>;
export type GetIntelligenceContextQueryError = ErrorType<unknown>;
/**
 * @summary Full workforce context data points (for future AI consumers)
 */
export declare function useGetIntelligenceContext<TData = Awaited<ReturnType<typeof getIntelligenceContext>>, TError = ErrorType<unknown>>(params?: GetIntelligenceContextParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIntelligenceContext>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUsersUrl: () => string;
/**
 * @summary List users (Admin only)
 */
export declare const listUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/admin/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<Error>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<Error>;
/**
 * @summary List users (Admin only)
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<Error>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateUserUrl: () => string;
/**
 * @summary Create a user (Admin only)
 */
export declare const createUser: (userInput: UserInput, options?: RequestInit) => Promise<User>;
export declare const getCreateUserMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export type CreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof createUser>>>;
export type CreateUserMutationBody = BodyType<UserInput>;
export type CreateUserMutationError = ErrorType<Error>;
/**
* @summary Create a user (Admin only)
*/
export declare const useCreateUser: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export declare const getGetUserUrl: (id: number) => string;
/**
 * @summary Get a user (Admin only)
 */
export declare const getUser: (id: number, options?: RequestInit) => Promise<User>;
export declare const getGetUserQueryKey: (id: number) => readonly [`/api/admin/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<Error>;
/**
 * @summary Get a user (Admin only)
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserUrl: (id: number) => string;
/**
 * @summary Update a user (Admin only)
 */
export declare const updateUser: (id: number, userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UserUpdate>;
export type UpdateUserMutationError = ErrorType<Error>;
/**
* @summary Update a user (Admin only)
*/
export declare const useUpdateUser: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getDeleteUserUrl: (id: number) => string;
/**
 * @summary Delete a user (Admin only)
 */
export declare const deleteUser: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteUserMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>;
export type DeleteUserMutationError = ErrorType<Error>;
/**
* @summary Delete a user (Admin only)
*/
export declare const useDeleteUser: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export declare const getListAuditLogUrl: (params?: ListAuditLogParams) => string;
/**
 * @summary List audit log entries (Admin only)
 */
export declare const listAuditLog: (params?: ListAuditLogParams, options?: RequestInit) => Promise<AuditLogEntry[]>;
export declare const getListAuditLogQueryKey: (params?: ListAuditLogParams) => readonly ["/api/audit-log", ...ListAuditLogParams[]];
export declare const getListAuditLogQueryOptions: <TData = Awaited<ReturnType<typeof listAuditLog>>, TError = ErrorType<Error>>(params?: ListAuditLogParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAuditLog>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAuditLog>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAuditLogQueryResult = NonNullable<Awaited<ReturnType<typeof listAuditLog>>>;
export type ListAuditLogQueryError = ErrorType<Error>;
/**
 * @summary List audit log entries (Admin only)
 */
export declare function useListAuditLog<TData = Awaited<ReturnType<typeof listAuditLog>>, TError = ErrorType<Error>>(params?: ListAuditLogParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAuditLog>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListNotificationsUrl: () => string;
/**
 * @summary List rule-based alerts in scope
 */
export declare const listNotifications: (options?: RequestInit) => Promise<Notification[]>;
export declare const getListNotificationsQueryKey: () => readonly ["/api/notifications"];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary List rule-based alerts in scope
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map