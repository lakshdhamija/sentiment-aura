export const successResponse = (data: any) => ({
  success: true,
  data,
  error: null,
});

export const errorResponse = (error: string) => ({
  success: false,
  data: null,
  error,
});
