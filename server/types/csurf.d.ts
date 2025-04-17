declare module 'csurf' {
  import { NextFunction, Request, Response } from 'express';

  interface CsrfOptions {
    value?: (req: Request) => string;
    cookie?: boolean | {
      key?: string;
      path?: string;
      domain?: string;
      secure?: boolean;
      maxAge?: number;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
      signed?: boolean;
      httpOnly?: boolean;
    };
    ignoreMethods?: string[];
    sessionKey?: string;
  }

  function csurf(options?: CsrfOptions): (req: Request, res: Response, next: NextFunction) => void;
  export = csurf;
}