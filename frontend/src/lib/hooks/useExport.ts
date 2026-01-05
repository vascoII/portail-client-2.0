import { useState, useCallback } from "react";

export interface ExportError {
  title: string;
  message: string;
  variant?: "error" | "warning" | "info" | "success";
}

export interface UseExportOptions {
  /**
   * Optional custom error handler
   */
  onError?: (error: Error) => void;
  
  /**
   * Optional custom success handler
   */
  onSuccess?: () => void;
  
  /**
   * Optional custom error title
   */
  errorTitle?: string;
}

/**
 * Custom hook for handling data export with error management
 * 
 * Provides a reusable way to handle export operations (Excel, PDF, etc.) with:
 * - Loading state management
 * - Error handling with environment-aware messages (dev/prod)
 * - Generic error formatting
 * 
 * Works for both Excel and PDF exports. The export function passed as parameter
 * should handle the specific format (Excel/PDF) and file download.
 * 
 * @param exportFunction - Async function that performs the export (Excel, PDF, etc.)
 * @param options - Optional configuration
 * @returns Object with handleExport function, isExporting state, and error state
 * 
 * @example
 * ```tsx
 * // Excel export
 * const { exportImmeubles } = useImmeubles();
 * const { handleExport, isExporting, error } = useExport(exportImmeubles);
 * 
 * // PDF export
 * const { getReport } = useImmeubles();
 * const handleExportPdf = async () => {
 *   await getReport(pkImmeuble, { type: null, energie: "EAU" });
 * };
 * const { handleExport, isExporting, error } = useExport(handleExportPdf);
 * 
 * // In component
 * <button onClick={handleExport} disabled={isExporting}>
 *   {isExporting ? "Export en cours..." : "Export Excel"}
 * </button>
 * {error && <Alert variant={error.variant} title={error.title} message={error.message} />}
 * ```
 */
export function useExport(
  exportFunction: () => Promise<void>,
  options: UseExportOptions = {}
): {
  handleExport: () => Promise<void>;
  isExporting: boolean;
  error: ExportError | null;
  clearError: () => void;
} {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<ExportError | null>(null);
  const { onError, onSuccess, errorTitle = "Erreur d'export" } = options;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      setError(null);
      await exportFunction();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error exporting:", err);
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
      
      // Determine error type based on error message
      let title = errorTitle;
      let message: string;
      
      if (errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch")) {
        title = "API non disponible";
        if (isDevelopment) {
          message = "Impossible de se connecter au serveur pour exporter les données. Veuillez vérifier votre connexion et réessayer.";
        } else {
          message = "Impossible de se connecter au serveur. Veuillez réessayer plus tard.";
        }
      } else if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
        title = "Erreur serveur";
        if (isDevelopment) {
          message = "Une erreur s'est produite côté serveur lors de l'export. Veuillez réessayer plus tard.";
        } else {
          message = "Une erreur s'est produite lors de l'export. Veuillez réessayer plus tard.";
        }
      } else if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        title = errorTitle;
        if (isDevelopment) {
          message = "L'endpoint d'export n'a pas été trouvé. Veuillez contacter le support.";
        } else {
          message = "L'export n'est pas disponible pour le moment. Veuillez réessayer plus tard.";
        }
      } else if (errorMessage.includes("Failed to export")) {
        title = "Échec de l'export";
        if (isDevelopment) {
          message = errorMessage.replace("Failed to export ", "").replace(/^[a-z]+: /i, "");
        } else {
          message = "L'export a échoué. Veuillez réessayer plus tard.";
        }
      } else {
        // Generic error
        if (isDevelopment) {
          message = errorMessage;
        } else {
          message = "Une erreur s'est produite lors de l'export. Veuillez réessayer plus tard.";
        }
      }
      
      const exportError: ExportError = {
        title,
        message,
        variant: "error",
      };
      
      setError(exportError);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsExporting(false);
    }
  }, [exportFunction, onError, onSuccess, errorTitle]);

  return {
    handleExport,
    isExporting,
    error,
    clearError,
  };
}

