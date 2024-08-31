import { validateDTO } from '../../../../src/handlers/controllers/v1/resources';
describe('zod validation decorator', () => {
  let req: any;
  let res: any;
  let next: any;
  let schema: any;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    schema = { safeParse: jest.fn() };
  });

  it('should call the next function if the schema is valid', () => {
    schema.safeParse.mockReturnValueOnce({ success: true });
    validateDTO(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return an error if the schema is invalid', () => {
    schema.safeParse.mockReturnValueOnce({ success: false, error: { errors: ['error'] } });
    validateDTO(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error_description: ['error'],
      error_code: 'INVALID_DATA',
    });
  });
});
