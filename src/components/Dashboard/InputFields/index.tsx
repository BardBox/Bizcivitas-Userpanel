import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextInputProps {
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  [x: string]: any;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  register,
  error,
  ...rest
}) => (
  <div className="mb-3">
    <label className="font-medium text-gray-700" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      className={`ml-2 border rounded px-2 py-1 text-gray-700 w-full ${
        error ? "border-red-500" : ""
      }`}
      {...register}
      {...rest}
    />
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);

interface SelectInputProps {
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  options: { value: string; label: string }[];
  error?: FieldError;
  [x: string]: any;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  register,
  options,
  error,
  ...rest
}) => (
  <div className="mb-3">
    <label className="font-medium text-gray-700" htmlFor={name}>
      {label}
    </label>
    <select
      id={name}
      className={`ml-2 border rounded px-2 py-1 text-gray-700 w-full ${
        error ? "border-red-500" : ""
      }`}
      {...register}
      {...rest}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);

interface TextAreaInputProps {
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  [x: string]: any;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  name,
  register,
  error,
  ...rest
}) => (
  <div className="mb-3">
    <label className="font-medium text-gray-700" htmlFor={name}>
      {label}
    </label>
    <textarea
      id={name}
      className={`ml-2 border rounded px-2 py-1 text-gray-700 w-full ${
        error ? "border-red-500" : ""
      }`}
      {...register}
      {...rest}
    />
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);
