import { useCallback } from 'react';
import type {
  FieldErrors,
  FieldValues,
  UseFormSetError,
  Path,
} from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { getErrorMessage, getErrorTranslationKey } from '@/lib/error-utils';
import { useTranslations } from 'next-intl';

interface UseFormErrorHandlerOptions<T extends FieldValues> {
  /**
   * react-hook-form's setError function
   */
  setError: UseFormSetError<T>;

  /**
   * Custom field name mapping for server errors
   * Maps server field names to form field names
   */
  fieldMapping?: Record<string, keyof T>;
}

/**
 * Hook for handling form errors with server-side validation support
 *
 * Features:
 * - Automatic extraction of validation errors from GraphQL responses
 * - Field-level error mapping
 * - User-friendly error messages with i18n support
 * - Snackbar notifications for general errors
 *
 * @example
 * ```tsx
 * const { handleFormError, handleFieldErrors } = useFormErrorHandler({
 *   setError,
 *   fieldMapping: {
 *     emailAddress: 'email', // Map server 'emailAddress' to form 'email'
 *   },
 * });
 *
 * const onSubmit = async (data) => {
 *   try {
 *     await mutation({ variables: data });
 *   } catch (error) {
 *     handleFormError(error);
 *   }
 * };
 *
 * // Or handle client-side validation errors
 * const onError = (errors) => {
 *   handleFieldErrors(errors);
 * };
 * ```
 */
export function useFormErrorHandler<T extends FieldValues>({
  setError,
  fieldMapping,
}: UseFormErrorHandlerOptions<T>) {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations();

  /**
   * Handle form submission errors (including server-side validation)
   */
  const handleFormError = useCallback(
    (error: unknown) => {
      // Extract error message
      const errorMessage = getErrorMessage(error, t('form.error.default'));

      // Check if it's a GraphQL validation error
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        const apolloError = error as {
          graphQLErrors?: Array<{
            extensions?: {
              code?: string;
              validationErrors?: Array<{
                field: string;
                message: string;
              }>;
            };
          }>;
        };

        // Extract validation errors
        const validationErrors = apolloError.graphQLErrors
          ?.filter((err) => err.extensions?.code === 'BAD_USER_INPUT')
          .flatMap((err) => err.extensions?.validationErrors || [])
          .filter(Boolean);

        if (validationErrors && validationErrors.length > 0) {
          // Map validation errors to form fields
          validationErrors.forEach((validationError) => {
            // Use field mapping if provided
            const mappedField =
              fieldMapping?.[validationError.field] || validationError.field;

            // Check if field exists in form
            if (mappedField) {
              setError(mappedField as Path<T>, {
                type: 'server',
                message: validationError.message,
              });
            }
          });

          // Show general validation error message
          enqueueSnackbar(t('form.error.validation'), {
            variant: 'error',
            autoHideDuration: 5000,
          });
          return;
        }
      }

      // Display general error message with translation if available
      const errorKey = getErrorTranslationKey(errorMessage);
      const friendlyMessage = errorKey ? t(`errors.${errorKey}`) : errorMessage;

      enqueueSnackbar(friendlyMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    },
    [setError, fieldMapping, enqueueSnackbar, t],
  );

  /**
   * Handle client-side field validation errors
   */
  const handleFieldErrors = useCallback(
    (errors: FieldErrors<T>) => {
      // Get first error message
      const firstError = Object.values(errors)[0];

      if (firstError?.message) {
        enqueueSnackbar(String(firstError.message), {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    },
    [enqueueSnackbar],
  );

  /**
   * Clear specific field error
   */
  const clearFieldError = useCallback(
    (fieldName: keyof T) => {
      setError(fieldName as Path<T>, {
        type: 'manual',
        message: undefined,
      });
    },
    [setError],
  );

  return {
    handleFormError,
    handleFieldErrors,
    clearFieldError,
  };
}
